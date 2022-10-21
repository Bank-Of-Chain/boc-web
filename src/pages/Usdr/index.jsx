import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Card from '@material-ui/core/Card'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import UndoIcon from '@material-ui/icons/Undo'
import Loading from '@/components/LoadingComponent'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import MyStatementForRiskOn from '@/components/MyStatement/MyStatementForRiskOn'
import MyVault from '@/components/MyVault'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'

// === Reducers === //
import { setCurrentTab } from '@/reducers/invest-reducer'

// === constants === //
import { USDC_ADDRESS_MATIC } from '@/constants/tokens'
import { INVEST_TAB } from '@/constants/invest'
import { IERC20_ABI } from '@/constants'

// === Utils === //
import { formatBalance } from '@/helpers/number-format'
import isEmpty from 'lodash/isEmpty'
import * as ethers from 'ethers'
import useVersionWapper from '@/hooks/useVersionWapper'
import { addToken } from '@/helpers/wallet'

// === Hooks === //
import { useSelector, useDispatch } from 'react-redux'
import useVaultOnRisk from '@/hooks/useVaultOnRisk'

// === Styles === //
import styles from './style'
import { useCallback } from 'react'

const useStyles = makeStyles(styles)
const { BigNumber } = ethers

const tokens = [USDC_ADDRESS_MATIC]

function Usdr(props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const { address, userProvider, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, UNISWAPV3_RISK_ON_VAULT, UNISWAPV3_RISK_ON_HELPER } = props

  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [personalVaultAddress, setPersonalVaultAddress] = useState()
  const [wantTokenForVault, setWantTokenForVault] = useState()
  const [wantTokenBalance, setWantTokenBalance] = useState(BigNumber.from(0))
  const [wantTokenDecimals, setWantTokenDecimals] = useState(0)
  const [wantTokenSymbol, setWantTokenSymbol] = useState('')
  const [isVisiable, setIsVisiable] = useState(true)

  const current = useSelector(state => state.investReducer.currentTab)
  const setCurrent = tab => {
    loadData()
    dispatch(setCurrentTab(tab))
  }
  const { baseInfo } = useVaultOnRisk(
    VAULT_FACTORY_ADDRESS,
    VAULT_FACTORY_ABI,
    personalVaultAddress,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER,
    userProvider
  )
  const { netMarketMakingAmount, estimatedTotalAssets, manageFeeBps, minimumInvestmentAmount } = baseInfo

  const handleAddToken = useCallback(() => {
    addToken(wantTokenForVault, wantTokenSymbol, wantTokenDecimals)
  }, [wantTokenForVault, wantTokenSymbol, wantTokenDecimals])

  const loadData = useCallback(() => {
    if (isEmpty(wantTokenForVault) || isEmpty(personalVaultAddress)) return

    setIsBalanceLoading(true)
    const wantTokenContract = new ethers.Contract(wantTokenForVault, IERC20_ABI, userProvider)

    Promise.all([wantTokenContract.balanceOf(address), wantTokenContract.decimals(), wantTokenContract.symbol()])
      .then(([balance, decimals, symbol]) => {
        setWantTokenBalance(balance)
        setWantTokenDecimals(decimals)
        setWantTokenSymbol(symbol)
      })
      .finally(() => {
        setTimeout(() => {
          setIsBalanceLoading(false)
        }, 500)
      })
    return loadData
  }, [wantTokenForVault, personalVaultAddress, address, userProvider])

  useEffect(() => {
    setInterval(loadData, 3000)
  }, [loadData])

  return (
    <div className={classes.container}>
      <GridContainer spacing={0}>
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
          </List>
        </GridItem>
        {current === INVEST_TAB.deposit && (
          <GridItem xs={9} sm={9} md={6}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}>
              <Deposit
                address={address}
                estimatedTotalAssets={estimatedTotalAssets}
                wantTokenBalance={wantTokenBalance}
                wantTokenDecimals={wantTokenDecimals}
                userProvider={userProvider}
                wantTokenSymbol={wantTokenSymbol}
                wantTokenForVault={wantTokenForVault}
                VAULT_ADDRESS={personalVaultAddress}
                VAULT_ABI={UNISWAPV3_RISK_ON_VAULT}
                isBalanceLoading={isBalanceLoading}
                minimumInvestmentAmount={minimumInvestmentAmount}
                manageFeeBps={manageFeeBps}
                modalOpenHandle={() => setIsVisiable(true)}
              />
            </div>
          </GridItem>
        )}
        {current === INVEST_TAB.withdraw && (
          <GridItem xs={9} sm={9} md={6}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}>
              <Withdraw
                address={address}
                userProvider={userProvider}
                estimatedTotalAssets={estimatedTotalAssets}
                wantTokenDecimals={wantTokenDecimals}
                wantTokenSymbol={wantTokenSymbol}
                VAULT_ADDRESS={personalVaultAddress}
                VAULT_ABI={UNISWAPV3_RISK_ON_VAULT}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadData}
                modalOpenHandle={() => setIsVisiable(true)}
              />
            </div>
          </GridItem>
        )}
        {current === INVEST_TAB.account && (
          <GridItem xs={9} sm={9} md={9}>
            <div className={isLayoutSm ? classes.wrapperMobile : classes.wrapper} style={{ background: 'none', paddingTop: '1rem', paddingLeft: 0 }}>
              <Card className={classes.balanceCard}>
                <div className={classes.setting}>
                  <SettingsOutlinedIcon style={{ color: '#A0A0A0' }} onClick={() => setIsVisiable(true)} />
                </div>
                <div className={classes.balanceCardItem}>
                  <div className={classes.balanceCardValue}>
                    <span
                      title={formatBalance(netMarketMakingAmount, wantTokenDecimals, {
                        showAll: true
                      })}
                    >
                      <Loading loading={isBalanceLoading}>{formatBalance(netMarketMakingAmount, wantTokenDecimals)}</Loading>
                    </span>
                    <span className={classes.symbol}>
                      <Loading loading={isEmpty(wantTokenSymbol) && isBalanceLoading}>{wantTokenSymbol}</Loading>
                    </span>
                    {userProvider && (
                      <span title="Add token address to wallet">
                        <AddCircleOutlineIcon className={classes.addTokenIcon} onClick={handleAddToken} fontSize="small" />
                      </span>
                    )}
                  </div>
                  <div className={classes.balanceCardLabel}>AVAILABLE BALANCE</div>
                </div>
              </Card>
              {!isEmpty(address) && !isEmpty(personalVaultAddress) && (
                <MyStatementForRiskOn
                  userProvider={userProvider}
                  VAULT_FACTORY_ABI={VAULT_FACTORY_ABI}
                  personalVaultAddress={personalVaultAddress}
                  wantTokenSymbol={wantTokenSymbol}
                  VAULT_FACTORY_ADDRESS={VAULT_FACTORY_ADDRESS}
                  UNISWAPV3_RISK_ON_VAULT={UNISWAPV3_RISK_ON_VAULT}
                  UNISWAPV3_RISK_ON_HELPER={UNISWAPV3_RISK_ON_HELPER}
                />
              )}
            </div>
          </GridItem>
        )}
        <Modal className={classes.modal} open={isVisiable} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
          <Paper elevation={3}>
            <MyVault
              tokens={tokens}
              address={address}
              userProvider={userProvider}
              VAULT_FACTORY_ADDRESS={VAULT_FACTORY_ADDRESS}
              VAULT_FACTORY_ABI={VAULT_FACTORY_ABI}
              vaultChangeHandle={(address, token) => {
                setIsVisiable(false)
                setPersonalVaultAddress(address)
                setWantTokenForVault(token)
              }}
              modalCloseHandle={() => setIsVisiable(false)}
            />
          </Paper>
        </Modal>
      </GridContainer>
    </div>
  )
}

export default useVersionWapper(Usdr, 'usdr')
