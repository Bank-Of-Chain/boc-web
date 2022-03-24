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
import TabPanel from '../../components/TabPanel'

import Deposit from './Deposit'
import Withdraw from './Withdraw'

import { useDispatch } from "react-redux"

// === Reducers === //
import { warmDialog } from "./../../reducers/meta-reducer"

// === constants === //
import {
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
  CHAIN_BROWSER_URL,
} from "../../constants"

// === Utils === //
import { toFixed } from "../../helpers/number-format"
import map from "lodash/map"
import isEmpty from "lodash/isEmpty"
import last from "lodash/last"
import noop from "lodash/noop"
import * as ethers from "ethers"

// === Styles === //
import styles from "./style"

const TABS = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw'
}
const useStyles = makeStyles(styles)
const { BigNumber } = ethers

export default function Invest (props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { address, userProvider } = props
  const [usdtBalance, setUsdtBalance] = useState(BigNumber.from(0))
  const [usdtDecimals, setUsdtDecimals] = useState(0)
  const [usdcBalance, setUsdcBalance] = useState(BigNumber.from(0))
  const [usdcDecimals, setUsdcDecimals] = useState(0)
  const [daiBalance, setDaiBalance] = useState(BigNumber.from(0))
  const [daiDecimals, setDaiDecimals] = useState(0)

  const [toBalance, setToBalance] = useState(BigNumber.from(0))
  const [totalSupply, setTotalSupply] = useState(BigNumber.from(0))
  const [beforeTotalAssets, setBeforeTotalAssets] = useState(BigNumber.from(0))
  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0))
  const [beforePerFullShare, setBeforePerFullShare] = useState(BigNumber.from(1))
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1))

  const [tab, setTab] = useState(TABS.DEPOSIT)

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const usdcContract = new ethers.Contract(USDC_ADDRESS, IERC20_ABI, userProvider)
    const daiContract = new ethers.Contract(DAI_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)

    Promise.all([
      usdtContract.balanceOf(address).then(() => setUsdtBalance(BigNumber.from('100000000000'))),
      usdcContract.balanceOf(address).then(() => setUsdcBalance(BigNumber.from('100000000000'))),
      daiContract.balanceOf(address).then(() => setDaiBalance(BigNumber.from('100000000000000000000000'))),
      vaultContract
        .balanceOf(address)
        .then(setToBalance)
        .catch(noop),
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare]) => {
          setTotalAssets(afterTotalAssets)
          setPerFullShare(afterPerFullShare)
        })
        .catch(noop),
      // TODO:此处的usdtDecimals较特别为10的幂的数值，主要是因为lend方法里的usdtDecimals取幂操作
      // 其他处的usdtDecimals都是为10**18或10**6
      usdtContract.decimals().then(setUsdtDecimals),
      usdcContract.decimals().then(setUsdcDecimals),
      daiContract.decimals().then(setDaiDecimals),
      vaultContract.totalSupply().then(setTotalSupply),
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

  const loadTotalAssets = () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    return Promise.all([vaultContract.totalAssets(), vaultContract.pricePerShare(), vaultContract.totalSupply()])
  }

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare, afterTotalSupply]) => {
          if (!afterTotalAssets.eq(beforeTotalAssets)) {
            setBeforeTotalAssets(totalAssets)
            setTotalAssets(afterTotalAssets)
          }
          if (!afterPerFullShare.eq(beforePerFullShare)) {
            setBeforePerFullShare(perFullShare)
            setPerFullShare(afterPerFullShare)
          }
          if (!afterTotalSupply.eq(totalSupply)) {
            setTotalSupply(afterTotalSupply)
          }
        })
        .catch(noop)
    const timer = setInterval(loadTotalAssetsFn, 3000)
    return () => clearInterval(timer)
    // eslint-disable-next-line
  }, [totalAssets.toString(), perFullShare.toString()])

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    loadBanlance()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    if (!isEmpty(address)) {
      vaultContract.on("Deposit", (...eventArgs) => {
        console.log("Deposit=", eventArgs)
        const block = last(eventArgs)
        block &&
          block
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
      vaultContract.on("Withdraw", (...eventArgs) => {
        console.log("Withdraw=", eventArgs)
        const block = last(eventArgs)
        block &&
          block
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
    }

    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
    // eslint-disable-next-line
  }, [address])

  const handleTabChange = (event, value) => setTab(value)

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>
          <GridItem xs={12} sm={12} md={8} className={classNames(classes.centerItem)}>
            <Card style={{ border: "1px solid #fff", padding: 20, backgroundColor: "transparent" }}>
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
                  usdtBalance={usdtBalance}
                  usdtDecimals={usdtDecimals}
                  usdcBalance={usdcBalance}
                  usdcDecimals={usdcDecimals}
                  daiBalance={daiBalance}
                  daiDecimals={daiDecimals}
                  totalAssets={totalAssets}
                  totalSupply={totalSupply}
                  address={address}
                  userProvider={userProvider}
                />
              </TabPanel>
              <TabPanel value={tab} index={TABS.WITHDRAW}>
                <Withdraw
                  beforePerFullShare={beforePerFullShare}
                  perFullShare={perFullShare}
                  toBalance={toBalance}
                  usdtDecimals={usdtDecimals}
                  userProvider={userProvider}
                />
              </TabPanel>
            </Card>
          </GridItem>
        </GridContainer>
        <p style={{ color: "#fff", letterSpacing: "0.01071em" }}>More Details</p>
        <TableContainer component={Paper} style={{ borderRadius: 0 }}>
          <Table className={classNames(classes.table)} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell className={classNames(classes.tableCell)}>Vault Symbol</TableCell>
                <TableCell className={classNames(classes.tableCell)}>Vault Address</TableCell>
                <TableCell className={classNames(classes.tableCell)}>PricePerShare</TableCell>
                {/* <TableCell className={classNames(classes.tableCell)}>质押通证符号</TableCell>
                <TableCell className={classNames(classes.tableCell)}>质押合约地址</TableCell> */}
                <TableCell className={classNames(classes.tableCell)}>TVL</TableCell>
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
                <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                  <CountTo
                    from={Number(beforePerFullShare.toBigInt())}
                    to={Number(perFullShare.toBigInt())}
                    speed={3500}
                  >
                    {v => toFixed(v, BigNumber.from(10).pow(usdtDecimals), 6)}
                  </CountTo>
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
                  <CountTo from={Number(beforeTotalAssets.toBigInt())} to={Number(totalAssets.toBigInt())} speed={3500}>
                    {v => {
                      return `${toFixed(v, BigNumber.from(10).pow(usdtDecimals), 6)} USDT`
                    }}
                  </CountTo>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
