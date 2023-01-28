import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import MyStatement from '@/components/MyStatement'
import LeverBoard from './LeverBoard'
import { MyAccountIcon, SwapIcon, WithdrawIcon, DepositIcon, SwitchIcon } from '@/components/SvgIcons'
import { useSelector, useDispatch } from 'react-redux'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'
import { setCurrentTab } from '@/reducers/invest-reducer'

// === constants === //
import { ETH_ADDRESS, ETH_DECIMALS } from '@/constants/tokens'
import { INVEST_TAB } from '@/constants/invest'
import { IERC20_ABI, CHAIN_ID } from '@/constants'

// === Utils === //
import isEmpty from 'lodash/isEmpty'
import last from 'lodash/last'
import * as ethers from 'ethers'
import useVersionWapper from '@/hooks/useVersionWapper'
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
    VAULT_BUFFER_ABI,
    CREDIT_FACADE_ADDRESS,
    CREDIT_FACADE_ABI,
    CREDIT_ADDRESS_ABI,
    CREDIT_MANAGER_ABI,
    POOL_SERVICE_ABI
  } = props

  const [ethBalance, setEthBalance] = useState(BigNumber.from(0))
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [ethiDecimals, setEthiDecimals] = useState(0)
  const ethDecimals = ETH_DECIMALS

  const [vaultBufferBalance, setVaultBufferBalance] = useState(BigNumber.from(0))
  const [vaultBufferDecimals, setVaultBufferDecimals] = useState(0)

  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

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

  useEffect(() => {
    setCurrent(INVEST_TAB.lever)
  }, [])

  const renderBody = () => {
    if (!userProvider) {
      return (
        <GridItem xs={9} sm={9} md={9}>
          <div className={classes.notConnect}>
            <div>Wallet not connected.</div>
            <div className={classes.textBottom}>Connect to your Wallet address to operate.</div>
          </div>
        </GridItem>
      )
    }

    return (
      <>
        {current === INVEST_TAB.deposit && (
          <GridItem xs={9} sm={9} md={7}>
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
          </GridItem>
        )}
        {current === INVEST_TAB.withdraw && (
          <GridItem xs={9} sm={9} md={7}>
            <div className={classes.wrapper}>
              <Withdraw
                address={address}
                ethiBalance={ethiBalance}
                ethiDecimals={ethiDecimals}
                userProvider={userProvider}
                VAULT_ADDRESS={VAULT_ADDRESS}
                ETH_ADDRESS={ETH_ADDRESS}
                VAULT_ABI={VAULT_ABI}
                IERC20_ABI={IERC20_ABI}
                PRICE_ORCALE_ABI={PRICE_ORCALE_ABI}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadCoinsBalance}
                exchangeManager={exchangeManager}
                EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
              />
            </div>
          </GridItem>
        )}
        {current === INVEST_TAB.account && (
          <GridItem xs={9} sm={9} md={9}>
            <MyStatement
              address={address}
              chain={`${CHAIN_ID}`}
              VAULT_ADDRESS={VAULT_ADDRESS}
              type={'ETHi'}
              balance={ethiBalance}
              vaultBufferBalance={vaultBufferBalance}
              tokenAddress={ETHI_ADDRESS}
              tokenDecimal={ethiDecimals}
            />
          </GridItem>
        )}
        {current === INVEST_TAB.lever && (
          <GridItem xs={9} sm={9} md={9}>
            <LeverBoard
              exchangeManager={exchangeManager}
              ETHI_ADDRESS={ETHI_ADDRESS}
              CREDIT_FACADE_ADDRESS={CREDIT_FACADE_ADDRESS}
              VAULT_BUFFER_ADDRESS={VAULT_BUFFER_ADDRESS}
              CREDIT_FACADE_ABI={CREDIT_FACADE_ABI}
              CREDIT_MANAGER_ABI={CREDIT_MANAGER_ABI}
              CREDIT_ADDRESS_ABI={CREDIT_ADDRESS_ABI}
              POOL_SERVICE_ABI={POOL_SERVICE_ABI}
              EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
              EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
              userProvider={userProvider}
            />
          </GridItem>
        )}
      </>
    )
  }

  return (
    <div className={classes.container}>
      <GridContainer spacing={0}>
        <GridItem xs={2} sm={2} md={3} style={{ paddingRight: '2rem' }}>
          <List disablePadding={true}>
            <ListItem key="My Account" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.account)}>
              <ListItemIcon>
                <MyAccountIcon color={current === INVEST_TAB.account ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'My Account'} className={classNames(current === INVEST_TAB.account ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem
              key="Deposit"
              button
              className={classNames(classes.item, current === INVEST_TAB.deposit && classes.check)}
              onClick={() => setCurrent(INVEST_TAB.deposit)}
            >
              <ListItemIcon>
                <DepositIcon color={current === INVEST_TAB.deposit ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Deposit'} className={classNames(current === INVEST_TAB.deposit ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="Withdraw" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.withdraw)}>
              <ListItemIcon>
                <WithdrawIcon color={current === INVEST_TAB.withdraw || current === INVEST_TAB.swap ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText
                  primary={'Withdraw'}
                  className={classNames(current === INVEST_TAB.withdraw || current === INVEST_TAB.swap ? classes.check : classes.text)}
                />
              )}
            </ListItem>
            <ListItem
              key="Lever"
              button
              className={classNames(classes.item, current === INVEST_TAB.lever && classes.check)}
              onClick={() => setCurrent(INVEST_TAB.lever)}
            >
              <ListItemIcon>
                <DepositIcon color={current === INVEST_TAB.lever ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Credit Account'} className={classNames(current === INVEST_TAB.lever ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem
              style={{ display: 'none' }}
              key="Swap"
              button
              className={classNames(classes.item, current === INVEST_TAB.swap && classes.check)}
              onClick={() => setCurrent(INVEST_TAB.swap)}
            >
              <ListItemIcon>
                <SwapIcon color={current === INVEST_TAB.swap ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Swap'} className={classNames(current === INVEST_TAB.swap ? classes.check : classes.text)} />}
            </ListItem>
            <ListItem key="Switch to USDi" button className={classNames(classes.item)} onClick={() => history.push('/usdi')}>
              <ListItemIcon>
                <SwitchIcon style={{ color: '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Switch to USDi'} className={classNames(classes.text)} />}
            </ListItem>
          </List>
        </GridItem>
        {renderBody()}
      </GridContainer>
    </div>
  )
}

export default useVersionWapper(Ethi, 'ethi')
