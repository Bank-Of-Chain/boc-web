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
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import TabPanel from "../../components/TabPanel"

import Deposit from "./Deposit"
import Withdraw from "./Withdraw"

import { useDispatch } from "react-redux"

// === Reducers === //
import { warmDialog } from "./../../reducers/meta-reducer"

// === constants === //
import { CHAIN_BROWSER_URL } from "../../constants"

// === Utils === //
import { toFixed, formatBalance } from "../../helpers/number-format"
import map from "lodash/map"
import isEmpty from "lodash/isEmpty"
import last from "lodash/last"
import noop from "lodash/noop"
import * as ethers from "ethers"
import useVersionWapper from "../../hooks/useVersionWapper"

// === Styles === //
import styles from "./style"

const TABS = {
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
}
const useStyles = makeStyles(styles)
const { BigNumber } = ethers

function Ethi (props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { 
    address,
    userProvider,
    loadWeb3Modal,
    ETH_ADDRESS,
    ETHI_ADDRESS,
    VAULT_ADDRESS,
    VAULT_ABI,
    IERC20_ABI,
    EXCHANGE_AGGREGATOR_ABI,
    EXCHANGE_ADAPTER_ABI
  } = props

  const [ethBalance, setEthBalance] = useState(BigNumber.from(0))
  const [ethDecimals, setEthDecimals] = useState(0)
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [ethiDecimals, setEthiDecimals] = useState(0)

  const [beforeTotalValue, setBeforeTotalValue] = useState(BigNumber.from(0))
  const [totalValue, setTotalValue] = useState(BigNumber.from(0))

  const [tab, setTab] = useState(TABS.DEPOSIT)

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance
    const ethiContract = new ethers.Contract(ETHI_ADDRESS, IERC20_ABI, userProvider)
    console.log(ethiContract)
    // TODO get ETH and ETHi and WETHi data
    Promise.all([]).catch(() => {
      setEthBalance(BigNumber.from(10 * 10 * 18))
      setEthDecimals(18)
      setEthiBalance(BigNumber.from(5.5 * 10 * 18))
      setEthiDecimals(18)
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
    if (isEmpty(VAULT_ADDRESS)) return
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then(afterTotalValue => {
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
  
      return () => vaultContract.removeAllListeners(["Mint", "Burn"])
    }
    return listener()
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  const loadTotalAssets = () => {
    // const ethiContract = new ethers.Contract(ETHI_ADDRESS, ETHI_ABI, userProvider)
    // return ethiContract.totalSupply()
    return Promise.resolve(BigNumber.from(0))
  }

  const handleTabChange = (event, value) => setTab(value)

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>
          <GridItem xs={12} sm={12} md={8} className={classNames(classes.centerItem)}>
            <Card className={classes.balanceCard}>
              <div className={classes.balanceCardItem}>
                <div
                  className={classes.balanceCardValue}
                  title={formatBalance(ethiBalance, ethiDecimals, { showAll: true })}
                >
                  {`${formatBalance(ethiBalance, ethiDecimals)} ETHi`}
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
                  indicator: classes.tabsIndicator,
                }}
                TabIndicatorProps={{ children: <span /> }}
              >
                {map(Object.keys(TABS), key => (
                  <Tab
                    key={key}
                    label={TABS[key]}
                    value={TABS[key]}
                    classes={{
                      root: classes.tabRoot,
                      textColorInherit: classes.tabTextColor,
                    }}
                  />
                ))}
              </Tabs>
              <TabPanel value={tab} index={TABS.DEPOSIT}>
                <Deposit
                  address={address}
                  ethBalance={ethBalance}
                  ethDecimals={ethDecimals}
                  userProvider={userProvider}
                  onConnect={loadWeb3Modal}
                  VAULT_ABI={VAULT_ABI}
                  IERC20_ABI={IERC20_ABI}
                  VAULT_ADDRESS={VAULT_ADDRESS}
                  ETH_ADDRESS={ETH_ADDRESS}
                />
              </TabPanel>
              <TabPanel value={tab} index={TABS.WITHDRAW}>
                <Withdraw
                  ethiBalance={ethiBalance}
                  ethiDecimals={ethiDecimals}
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
        <div
          className={classNames(classes.detailWrapper, {
            [classes.hidden]: isEmpty(userProvider),
          })}
        >
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
                  <TableCell className={classNames(classes.tableCell)}>
                    <CountTo from={Number(beforeTotalValue.toBigInt())} to={Number(totalValue.toBigInt())} speed={3500}>
                      {v => {
                        return `${toFixed(v, BigNumber.from(10).pow(ethiDecimals), 6)} USDi`
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

export default useVersionWapper(Ethi, 'ethi')