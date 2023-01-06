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
import MyStatement from '@/components/MyStatement/MyStatementForLend'
import PoolsTable from './PoolsTable'
import { DepositIcon, SwitchIcon } from '@/components/SvgIcons'
import { useSelector, useDispatch } from 'react-redux'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'

// === Reducers === //
import { warmDialog } from '@/reducers/meta-reducer'
import { setCurrentTab } from '@/reducers/invest-reducer'

// === constants === //
import { ETH_ADDRESS, ETH_DECIMALS } from '@/constants/tokens'
import { INVEST_TAB } from '@/constants/invest'
import { IERC20_ABI } from '@/constants'

// === Hooks === //
import usePool from '@/hooks/usePool'

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

const Lend = props => {
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
    POOL_ADDRESS,
    POOL_ABI
  } = props

  console.log('POOL_ADDRESS=', POOL_ADDRESS)

  const [ethBalance, setEthBalance] = useState(BigNumber.from(0))
  const [ethiBalance, setEthiBalance] = useState(BigNumber.from(0))
  const [ethiDecimals, setEthiDecimals] = useState(0)
  const ethDecimals = ETH_DECIMALS

  const [vaultBufferBalance, setVaultBufferBalance] = useState(BigNumber.from(0))
  const [vaultBufferDecimals, setVaultBufferDecimals] = useState(0)

  const [isBalanceLoading, setIsBalanceLoading] = useState(false)

  const [operateIndex, setOperateIndex] = useState(-1)
  const [operateType, setOperateType] = useState(false)

  const current = useSelector(state => state.investReducer.currentTab)
  const setCurrent = tab => {
    loadCoinsBalance()
    dispatch(setCurrentTab(tab))
  }
  const { minimumInvestmentAmount, exchangeManager } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider)

  const { balance, supply } = usePool(POOL_ADDRESS, POOL_ABI, userProvider)

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
    setCurrent(INVEST_TAB.lending)
  }, [])

  const renderBody = () => {
    if (!userProvider)
      return (
        <GridItem xs={9} sm={9} md={9}>
          <div className={classes.notConnect}>
            <div>Wallet not connected.</div>
            <div className={classes.textBottom}>Connect to your Wallet address to operate.</div>
          </div>
        </GridItem>
      )
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
            <MyStatement balance={balance} supply={supply} />
          </GridItem>
        )}
        {current === INVEST_TAB.lending && (
          <GridItem xs={9} sm={9} md={9}>
            <PoolsTable
              actions={(index, type) => {
                setOperateIndex(index)
                setOperateType(type)
              }}
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
            <ListItem key="Lending Pools" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.lending)}>
              <ListItemIcon>
                <DepositIcon color={current === INVEST_TAB.lending ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Lending Pools'} className={classNames(current === INVEST_TAB.lending ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="Back to ETHi" button className={classNames(classes.item)} onClick={() => history.push('/ethi')}>
              <ListItemIcon>
                <SwitchIcon style={{ color: '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Back to ETHi'} className={classNames(classes.text)} />}
            </ListItem>
          </List>
        </GridItem>
        {renderBody()}
      </GridContainer>
      <Modal
        className={classes.modal}
        open={operateIndex !== -1 && operateType === false}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper elevation={3} className={classes.depositModal}>
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
            onCancel={() => setOperateIndex(-1)}
          />
        </Paper>
      </Modal>
      <Modal
        className={classes.modal}
        open={operateIndex !== -1 && operateType === true}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper elevation={3} className={classes.depositModal}>
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
            onCancel={() => setOperateIndex(-1)}
          />
        </Paper>
      </Modal>
    </div>
  )
}

export default useVersionWapper(Lend, 'lend')
