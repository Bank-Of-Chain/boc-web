import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import GridItem from '@/components/Grid/GridItem'
import GridContainer from '@/components/Grid/GridContainer'
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import MyStatement from '@/components/MyStatement'
import { MyAccountIcon, SwapIcon, WithdrawIcon, DepositIcon, SwitchIcon } from '@/components/SvgIcons'

// === Reducers === //
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentTab } from '@/reducers/invest-reducer'

// === Constants === //
import { NET_WORKS, CHAIN_ID } from '@/constants'
import { INVEST_TAB } from '@/constants/invest'

// === Hooks === //
import useVault from '@/hooks/useVault'
import useUserAddress from '@/hooks/useUserAddress'
import useVersionWapper from '@/hooks/useVersionWapper'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

function Invest(props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const { userProvider, VAULT_ADDRESS, VAULT_ABI, USDI_ADDRESS, EXCHANGE_AGGREGATOR_ABI, EXCHANGE_ADAPTER_ABI, VAULT_BUFFER_ADDRESS } = props

  const current = useSelector(state => state.investReducer.currentTab)

  const address = useUserAddress(userProvider)

  const setCurrent = tab => {
    dispatch(setCurrentTab(tab))
  }

  const { minimumInvestmentAmount, exchangeManager, redeemFeeBps, trusteeFeeBps } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider)

  const changeRouter = path => {
    let promise = Promise.resolve({})
    if (path === '#/ethi' && CHAIN_ID !== 1) {
      promise = props.changeNetwork(NET_WORKS[0])
    }
    promise.then(() => {
      history.push(path.slice(1))
    })
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
            <ListItem
              key="Withdraw"
              button
              className={classNames(classes.item, { [classes.check]: current === INVEST_TAB.withdraw || current === INVEST_TAB.swap })}
              onClick={() => setCurrent(INVEST_TAB.withdraw)}
            >
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
              style={{ display: 'none' }}
              key="Swap"
              button
              className={classNames(classes.item, current === INVEST_TAB.withdraw && classes.check)}
              onClick={() => setCurrent(INVEST_TAB.swap)}
            >
              <ListItemIcon>
                <SwapIcon color={current === INVEST_TAB.swap ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Swap'} className={classNames(current === INVEST_TAB.swap ? classes.check : classes.text)} />}
            </ListItem>
            <ListItem key="Switch to ETHi" button className={classNames(classes.item, classes.check)} onClick={() => changeRouter('#/ethi')}>
              <ListItemIcon>
                <SwitchIcon style={{ color: '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Switch to ETHi'} className={classNames(classes.text)} />}
            </ListItem>
          </List>
        </GridItem>
        {!userProvider && (
          <GridItem xs={9} sm={9} md={9}>
            <div className={classes.notConnect}>
              <div>Wallet not connected.</div>
              <div className={classes.textBottom}>Connect to your Wallet address to operate.</div>
            </div>
          </GridItem>
        )}
        {address && (
          <>
            {current === INVEST_TAB.deposit && (
              <GridItem xs={9} sm={9} md={7}>
                <Deposit
                  VAULT_BUFFER_ADDRESS={VAULT_BUFFER_ADDRESS}
                  userProvider={userProvider}
                  VAULT_ABI={VAULT_ABI}
                  VAULT_ADDRESS={VAULT_ADDRESS}
                  minimumInvestmentAmount={minimumInvestmentAmount}
                />
              </GridItem>
            )}
            {current === INVEST_TAB.withdraw && (
              <GridItem xs={9} sm={9} md={7}>
                <div className={classes.wrapper}>
                  <Withdraw
                    USDI_ADDRESS={USDI_ADDRESS}
                    userProvider={userProvider}
                    VAULT_ADDRESS={VAULT_ADDRESS}
                    VAULT_ABI={VAULT_ABI}
                    redeemFeeBps={redeemFeeBps}
                    trusteeFeeBps={trusteeFeeBps}
                    EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
                    exchangeManager={exchangeManager}
                    EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                  />
                </div>
              </GridItem>
            )}
            {current === INVEST_TAB.account && (
              <GridItem xs={9} sm={9} md={9}>
                <MyStatement
                  chain={`${CHAIN_ID}`}
                  type={'USDi'}
                  VAULT_ADDRESS={VAULT_ADDRESS}
                  userProvider={userProvider}
                  PEG_TOKEN_ADDRESS={USDI_ADDRESS}
                  VAULT_BUFFER_ADDRESS={VAULT_BUFFER_ADDRESS}
                />
              </GridItem>
            )}
          </>
        )}
      </GridContainer>
    </div>
  )
}

export default useVersionWapper(Invest, 'mutilCoins')
