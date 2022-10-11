import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@material-ui/core/Card'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import UndoIcon from '@material-ui/icons/Undo'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import Loading from '@/components/LoadingComponent'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import MyStatement from '@/components/MyStatement'
import InsertChartIcon from '@material-ui/icons/InsertChart'

import { useSelector, useDispatch } from 'react-redux'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'
import { setCurrentTab } from '@/reducers/invest-reducer'

// === constants === //
import { ETH_ADDRESS, ETH_DECIMALS } from '@/constants/tokens'
import { INVEST_TAB } from '@/constants/invest'
import { IERC20_ABI, CHAIN_ID } from '@/constants'

// === Utils === //
import moment from 'moment'
import { formatBalance } from '@/helpers/number-format'
import isEmpty from 'lodash/isEmpty'
import last from 'lodash/last'
import noop from 'lodash/noop'
import * as ethers from 'ethers'
import useVersionWapper from '@/hooks/useVersionWapper'
import { addToken } from '@/helpers/wallet'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import useVault from '@/hooks/useVault'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)
const { BigNumber } = ethers

function Ethi(props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const {
    address,
    userProvider,
    ETHI_ADDRESS,
    VAULT_ADDRESS,
    VAULT_ABI,
    EXCHANGE_AGGREGATOR_ABI,
    EXCHANGE_ADAPTER_ABI,
    PRICE_ORCALE_ABI,
    VAULT_BUFFER_ADDRESS,
    VAULT_BUFFER_ABI
  } = props

  const [ethBalance, setEthBalance] = useState(BigNumber.from(0))
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [ethiDecimals, setEthiDecimals] = useState(0)
  const ethDecimals = ETH_DECIMALS

  const [beforeTotalValue, setBeforeTotalValue] = useState(BigNumber.from(0))
  const [totalValue, setTotalValue] = useState(BigNumber.from(0))

  const [vaultBufferBalance, setVaultBufferBalance] = useState(BigNumber.from(0))
  const [vaultBufferDecimals, setVaultBufferDecimals] = useState(0)

  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

  const lastRebaseTime = getLastPossibleRebaseTime()

  const current = useSelector(state => state.investReducer.currentTab)
  const setCurrent = tab => {
    loadCoinsBalance()
    dispatch(setCurrentTab(tab))
  }
  const { minimumInvestmentAmount, exchangeManager } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider)

  // load user balance
  const loadBalance = () => {
    if (isEmpty(address) || isEmpty(userProvider) || isEmpty(ETHI_ADDRESS) || isEmpty(VAULT_BUFFER_ADDRESS)) {
      return
    }
    const vaultBufferContract = new ethers.Contract(VAULT_BUFFER_ADDRESS, VAULT_BUFFER_ABI, userProvider)
    const ethiContract = new ethers.Contract(ETHI_ADDRESS, IERC20_ABI, userProvider)
    Promise.all([
      loadCoinsBalance(),
      ethiContract
        .decimals()
        .then(setEthiDecimals)
        .catch(() => setEthiDecimals(1)),
      vaultBufferContract
        .decimals()
        .then(setVaultBufferDecimals)
        .catch(() => setVaultBufferDecimals(1))
    ]).catch(() => {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: "Please confirm wallet's network!"
        })
      )
    })
  }

  const loadCoinsBalance = () => {
    if (isEmpty(address) || isEmpty(userProvider) || isEmpty(ETHI_ADDRESS) || isEmpty(VAULT_BUFFER_ADDRESS)) {
      return
    }
    setIsBalanceLoading(true)
    const vaultBufferContract = new ethers.Contract(VAULT_BUFFER_ADDRESS, VAULT_BUFFER_ABI, userProvider)
    const ethiContract = new ethers.Contract(ETHI_ADDRESS, IERC20_ABI, userProvider)
    return Promise.all([
      ethiContract.balanceOf(address).catch(() => BigNumber.from(0)),
      userProvider.getBalance(address),
      vaultBufferContract.balanceOf(address).catch(() => BigNumber.from(0))
    ])
      .then(([ethiBalance, ethBalance, vaultBufferBalance]) => {
        setEthBalance(ethBalance)
        setEthiBalance(ethiBalance)
        setVaultBufferBalance(vaultBufferBalance)
        return [ethiBalance, ethBalance, vaultBufferBalance]
      })
      .finally(() => {
        setTimeout(() => {
          setIsBalanceLoading(false)
        }, 500)
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
  }, [totalValue.toString()])

  function handleMint(...eventArgs) {
    console.log('Mint=', eventArgs)
    const block = last(eventArgs)
    block &&
      block
        .getTransaction()
        .then(tx => tx.wait())
        .then(loadBalance)
  }
  function handleBurn(...eventArgs) {
    console.log('Burn=', eventArgs)
    const block = last(eventArgs)
    block &&
      block
        .getTransaction()
        .then(tx => tx.wait())
        .then(loadBalance)
  }

  useEffect(() => {
    const listener = () => {
      if (isEmpty(VAULT_ABI) || isEmpty(userProvider)) return
      loadBalance()
      if (isEmpty(VAULT_ADDRESS)) return
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      if (!isEmpty(address)) {
        vaultContract.on('Mint', handleMint)
        vaultContract.on('Burn', handleBurn)
        return () => {
          vaultContract.off('Mint', handleMint)
          vaultContract.off('Burn', handleBurn)
        }
      }
    }
    return listener()
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  const loadTotalAssets = () => {
    const ethiContract = new ethers.Contract(ETHI_ADDRESS, IERC20_ABI, userProvider)
    return ethiContract.totalSupply()
  }

  const handleAddETHi = () => {
    addToken(ETHI_ADDRESS, 'ETHi', 18)
  }

  return (
    <div className={classes.container}>
      <GridContainer spacing={0} style={{ paddingTop: '100px' }}>
        <GridItem xs={2} sm={2} md={3} style={{ paddingLeft: '2rem' }}>
          <List>
            <ListItem key="My Account" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.account)}>
              <ListItemIcon>
                <AccountBalanceWalletIcon style={{ color: current === INVEST_TAB.account ? '#A68EFE' : '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'My Account'} className={classNames(current === INVEST_TAB.account ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="My Statement" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.statement)}>
              <ListItemIcon>
                <InsertChartIcon style={{ color: current === INVEST_TAB.statement ? '#A68EFE' : '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'My Statement'} className={classNames(current === INVEST_TAB.statement ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem
              key="Deposit"
              button
              className={classNames(classes.item, current === INVEST_TAB.deposit && classes.check)}
              onClick={() => setCurrent(INVEST_TAB.deposit)}
            >
              <ListItemIcon>
                <SaveAltIcon style={{ color: current === INVEST_TAB.deposit ? '#A68EFE' : '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Deposit'} className={classNames(current === INVEST_TAB.deposit ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="Withdraw" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.withdraw)}>
              <ListItemIcon>
                <UndoIcon style={{ color: current === INVEST_TAB.withdraw ? '#A68EFE' : '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Withdraw'} className={classNames(current === INVEST_TAB.withdraw ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="Switch to USDi" button className={classNames(classes.item)} onClick={() => history.push('/mutils')}>
              <ListItemIcon>
                <SwapHorizIcon style={{ color: '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Switch to USDi'} className={classNames(classes.text)} />}
            </ListItem>
          </List>
        </GridItem>
        {current === INVEST_TAB.account && (
          <GridItem xs={9} sm={9} md={6}>
            <Card className={classes.balanceCard}>
              <div className={classes.balanceCardItem}>
                <div className={classes.balanceCardValue}>
                  <span
                    title={formatBalance(ethiBalance, ethiDecimals, {
                      showAll: true
                    })}
                  >
                    <Loading loading={isBalanceLoading}>{formatBalance(ethiBalance, ethiDecimals)}</Loading>
                  </span>
                  <span className={classes.symbol}>ETHi</span>
                  {userProvider && (
                    <span title="Add token address to wallet">
                      <AddCircleOutlineIcon className={classes.addTokenIcon} onClick={handleAddETHi} fontSize="small" />
                    </span>
                  )}
                </div>
                <div className={classes.balanceCardValue} style={{ fontSize: '1rem' }}>
                  <span title={formatBalance(vaultBufferBalance, vaultBufferDecimals, { showAll: true })}>
                    <Loading loading={isBalanceLoading}>{formatBalance(vaultBufferBalance, vaultBufferDecimals)}</Loading>
                  </span>
                  <span className={classes.symbol}>ETHi Ticket&nbsp;&nbsp;</span>
                  <Tooltip
                    classes={{
                      tooltip: classes.tooltip
                    }}
                    placement="right"
                    title={
                      <span>
                        ETHi Ticket functions as parallel ETHi that will be converted into ETHi after fund allocations have been successful. Last
                        execution time was&nbsp;
                        <span style={{ fontWeight: 'bold' }}>{moment(lastRebaseTime).format('yyyy-MM-DD HH:mm')}</span>
                      </span>
                    }
                  >
                    <InfoIcon style={{ fontSize: '1rem' }} />
                  </Tooltip>
                </div>
                <div className={classes.balanceCardLabel}>AVAILABLE BALANCE</div>
              </div>
            </Card>
          </GridItem>
        )}
        {current === INVEST_TAB.deposit && (
          <GridItem xs={9} sm={9} md={6}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}>
              <Deposit
                address={address}
                ethBalance={ethBalance}
                ethDecimals={ethDecimals}
                ethiBalance={ethiBalance}
                ethiDecimals={ethiDecimals}
                userProvider={userProvider}
                VAULT_ABI={VAULT_ABI}
                IERC20_ABI={IERC20_ABI}
                VAULT_ADDRESS={VAULT_ADDRESS}
                ETH_ADDRESS={ETH_ADDRESS}
                vaultBufferBalance={vaultBufferBalance}
                vaultBufferDecimals={vaultBufferDecimals}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadCoinsBalance}
                minimumInvestmentAmount={minimumInvestmentAmount}
              />
            </div>
          </GridItem>
        )}
        {current === INVEST_TAB.withdraw && (
          <GridItem xs={9} sm={9} md={6}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}>
              <Withdraw
                address={address}
                exchangeManager={exchangeManager}
                ethiBalance={ethiBalance}
                ethiDecimals={ethiDecimals}
                userProvider={userProvider}
                VAULT_ADDRESS={VAULT_ADDRESS}
                ETH_ADDRESS={ETH_ADDRESS}
                VAULT_ABI={VAULT_ABI}
                IERC20_ABI={IERC20_ABI}
                EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
                EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                PRICE_ORCALE_ABI={PRICE_ORCALE_ABI}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadCoinsBalance}
              />
            </div>
          </GridItem>
        )}
        {current === INVEST_TAB.statement && (
          <GridItem xs={9} sm={9} md={9}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper} style={{ background: 'none', paddingTop: '1rem', paddingLeft: 0 }}>
              <MyStatement address={address} chain={`${CHAIN_ID}`} VAULT_ADDRESS={VAULT_ADDRESS} type={'ETHi'} />
            </div>
          </GridItem>
        )}
      </GridContainer>
    </div>
  )
}

export default useVersionWapper(Ethi, 'ethi')
