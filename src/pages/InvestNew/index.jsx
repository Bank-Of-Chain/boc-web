/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
import CountTo from "react-count-to"
// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
// sections for this page
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import Card from "@material-ui/core/Card"
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import CircularProgress from '@material-ui/core/CircularProgress'
import TabPanel from '../../components/TabPanel'

import Deposit from './Deposit'
import Withdraw from './Withdraw'

import { useDispatch } from "react-redux"

// === Reducers === //
import { warmDialog } from "./../../reducers/meta-reducer"

// === constants === //
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, CHAIN_BROWSER_URL } from "../../constants"

// === Utils === //
import { toFixed, formatBalance } from "../../helpers/number-format"
import map from "lodash/map"
import isEmpty from "lodash/isEmpty"
import isUndefined from "lodash/isUndefined"
import last from "lodash/last"
import noop from "lodash/noop"
import * as ethers from "ethers"
import { calVaultAPY } from "../../helpers/apy"
import { getETHLast30DaysVaultData } from "../../services/subgraph-service"
import useVersionWapper from "../../hooks/useVersionWapper"

// === Styles === //
import styles from "./style"

const TABS = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw'
}
const useStyles = makeStyles(styles)
const { BigNumber } = ethers

function Invest (props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { address, userProvider, loadWeb3Modal, vault_address: VAULT_ADDRESS, VAULT_ABI, usdi_address: USDI_ADDRESS, IERC20_ABI, EXCHANGE_AGGREGATOR_ABI, USDI_ABI, EXCHANGE_ADAPTER_ABI } = props
  const [apy, setApy] = useState()
  const [usdtBalance, setUsdtBalance] = useState(BigNumber.from(0))
  const [usdtDecimals, setUsdtDecimals] = useState(0)
  const [usdcBalance, setUsdcBalance] = useState(BigNumber.from(0))
  const [usdcDecimals, setUsdcDecimals] = useState(0)
  const [daiBalance, setDaiBalance] = useState(BigNumber.from(0))
  const [daiDecimals, setDaiDecimals] = useState(0)
  const [usdiDecimals, setUsdiDecimals] = useState(0)

  const [toBalance, setToBalance] = useState(BigNumber.from(0))
  const [beforeTotalValue, setBeforeTotalValue] = useState(BigNumber.from(0))
  const [totalValue, setTotalValue] = useState(BigNumber.from(0))

  const [tab, setTab] = useState(TABS.DEPOSIT)

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20_ABI, userProvider)
    const daiContract = new ethers.Contract(DAI_ADDRESS, IERC20_ABI, userProvider)
    const usdiContract = new ethers.Contract(USDI_ADDRESS, USDI_ABI, userProvider)
    Promise.all([
      usdtContract.balanceOf(address).then(setUsdtBalance),
      usdcContract.balanceOf(address).then(setUsdcBalance),
      daiContract.balanceOf(address).then(setDaiBalance),
      usdiContract.balanceOf(address).then(setToBalance).catch(noop),
      loadTotalAssets()
        .then((afterTotalValue) => {
          setTotalValue(afterTotalValue)
        })
        .catch(noop),
      // TODO:此处的usdtDecimals较特别为10的幂的数值，主要是因为lend方法里的usdtDecimals取幂操作
      // 其他处的usdtDecimals都是为10**18或10**6
      usdtContract.decimals().then(setUsdtDecimals),
      usdcContract.decimals().then(setUsdcDecimals),
      daiContract.decimals().then(setDaiDecimals),
      usdiContract.decimals().then(setUsdiDecimals),
      // vaultContract.token().then(setToken),
      // vaultContract.getTrackedAssets().then(setTrackedAssets)
    ]).catch(() => {
      dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please confirm MetaMask's network!",
        }),
      )
    })
  }

  useEffect(() => {
    getETHLast30DaysVaultData().then(a => {
      setApy((100 * calVaultAPY(a)).toFixed(2))
    })
  }, [])

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then((afterTotalValue) => {
          if (!afterTotalValue.eq(beforeTotalValue)) {
            setBeforeTotalValue(totalValue)
            setTotalValue(afterTotalValue)
          }
        })
        .catch(noop)
    const timer = setInterval(loadTotalAssetsFn, 3000)
    return () => clearInterval(timer)
    // eslint-disable-next-line
  }, [totalValue.toString()])

  useEffect(() => {
    const listener = () => {
      if (isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI)) return
      loadBanlance()
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      if (!isEmpty(address)) {
        vaultContract.on("Mint", (...eventArgs) => {
          console.log("Mint=", eventArgs)
          const block = last(eventArgs)
          block &&
            block
              .getTransaction()
              .then(tx => tx.wait())
              .then(loadBanlance)
        })
        vaultContract.on("Burn", (...eventArgs) => {
          console.log("Burn=", eventArgs)
          const block = last(eventArgs)
          block &&
            block
              .getTransaction()
              .then(tx => tx.wait())
              .then(loadBanlance)
        })
      }

      return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
    }
    return listener()
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  const loadTotalAssets = () => {
    const usdiContract = new ethers.Contract(USDI_ADDRESS, USDI_ABI, userProvider)
    return usdiContract.totalSupply()
  }

  const handleTabChange = (event, value) => setTab(value)

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>
          <GridItem xs={12} sm={12} md={8} className={classNames(classes.centerItem)}>
            <Card className={classes.balanceCard}>
              <div className={classes.balanceCardItem} style={{ display: 'none' }}>
                <div className={classes.balanceCardValue}>{isUndefined(apy) ? <CircularProgress size={21} /> : `${apy}%`}</div>
                <div className={classes.balanceCardLabel}>APY (last 30 days)</div>
              </div>
              <div className={classes.balanceCardItem}>
                <div className={classes.balanceCardValue} title={formatBalance(toBalance, usdiDecimals, { showAll: true })}>
                  {`${formatBalance(toBalance, usdiDecimals)} USDi`}
                </div>
                <div className={classes.balanceCardLabel}>Balance</div>
              </div>
            </Card>
            <Card className={classes.investCard}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                classes={{
                  root: classes.tabsRoot,
                  indicator: classes.tabsIndicator
                }}
                TabIndicatorProps={{ children: <span /> }}
              >
                  {map(Object.keys(TABS), (key) => (
                    <Tab
                      key={key}
                      label={TABS[key]}
                      value={TABS[key]}
                      classes={{
                        root: classes.tabRoot,
                        textColorInherit: classes.tabTextColor
                      }}
                    />
                  ))}
              </Tabs>
              <TabPanel value={tab} index={TABS.DEPOSIT}>
                <Deposit
                  address={address}
                  usdtBalance={usdtBalance}
                  usdtDecimals={usdtDecimals}
                  usdcBalance={usdcBalance}
                  usdcDecimals={usdcDecimals}
                  daiBalance={daiBalance}
                  daiDecimals={daiDecimals}
                  usdiDecimals={usdiDecimals}
                  userProvider={userProvider}
                  onConnect={loadWeb3Modal}
                  VAULT_ABI={VAULT_ABI}
                  IERC20_ABI={IERC20_ABI}
                  VAULT_ADDRESS={VAULT_ADDRESS}
                />
              </TabPanel>
              <TabPanel value={tab} index={TABS.WITHDRAW}>
                <Withdraw
                  toBalance={toBalance}
                  usdiDecimals={usdiDecimals}
                  userProvider={userProvider}
                  onConnect={loadWeb3Modal}
                  VAULT_ADDRESS={VAULT_ADDRESS}
                  VAULT_ABI={VAULT_ABI}
                  IERC20_ABI={IERC20_ABI}
                  EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
                  EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                />
              </TabPanel>
            </Card>
          </GridItem>
        </GridContainer>
        <div className={classNames(classes.detailWrapper, {
            [classes.hidden]: isEmpty(userProvider)
          })}>
            <p style={{ color: "#fff", letterSpacing: "0.01071em" }}>More Details</p>
            <TableContainer component={Paper} style={{ borderRadius: 0 }}>
              <Table className={classNames(classes.table)} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell className={classNames(classes.tableCell)}>Vault Symbol</TableCell>
                    <TableCell className={classNames(classes.tableCell)}>Vault Address</TableCell>
                    {/* <TableCell className={classNames(classes.tableCell)}>质押通证符号</TableCell>
                    <TableCell className={classNames(classes.tableCell)}>质押合约地址</TableCell> */}
                    <TableCell className={classNames(classes.tableCell)}>Total Supply</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                      BOC_Vault
                    </TableCell>
                    <TableCell className={classNames(classes.tableCell)}>
                      <a
                        style={{ color: "rgb(105, 192, 255)" }}
                        href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${VAULT_ADDRESS}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {VAULT_ADDRESS}
                      </a>
                    </TableCell>
                    {/* <TableCell className={classNames(classes.tableCell)}>USDT</TableCell>
                    <TableCell className={classNames(classes.tableCell)}>
                      <a
                        style={{ color: "rgb(105, 192, 255)" }}
                        href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${USDT_ADDRESS}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {USDT_ADDRESS}
                      </a>
                    </TableCell> */}
                    <TableCell className={classNames(classes.tableCell)}>
                      <CountTo from={Number(beforeTotalValue.toBigInt())} to={Number(totalValue.toBigInt())} speed={3500}>
                        {v => {
                          return `${toFixed(v, BigNumber.from(10).pow(usdiDecimals), 6)} USDi`
                        }}
                      </CountTo>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
        </div>
      </div>
    </div>
  )
}


export default useVersionWapper(Invest, '2')