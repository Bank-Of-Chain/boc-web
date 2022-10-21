import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import copy from 'copy-to-clipboard'
import { warmDialog } from '@/reducers/meta-reducer'
import { setCurrentTab } from '@/reducers/invest-reducer'

import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'

// @material-ui/icons
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined'
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import PaymentOutlinedIcon from '@material-ui/icons/PaymentOutlined'

// core components
import Button from '../CustomButtons/Button'
import styles from './headerLinksStyle'
import Address from '../Address/Address'
import CustomDropdown from '../CustomDropdown/CustomDropdown'
import WalletModal from '../WalletModal'

// === Utils === //
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import get from 'lodash/get'
import find from 'lodash/find'
import { isInMobileWalletApp, isInMobileH5 } from '@/helpers/plugin-util'
import { isMarketingHost } from '@/helpers/location'
import { useLocation } from 'react-router-dom'

// === Constants === //
import { NET_WORKS, DASHBOARD_URL, DOCUMENT_URL, CHAIN_ID, LEGACYS, POLYGON_HIDDEN } from '@/constants'
import { INVEST_TAB } from '@/constants/invest'

const CHAIN_SELECTOR_SHOW_ROUTER = ['/usdi']

const useStyles = makeStyles(styles)
export default function HeaderLinks(props) {
  const { address, userProvider, connect, disconnect, walletName } = props
  const [walletModalVisible, setWalletModalVisible] = useState(false)
  const classes = useStyles()
  const dispatch = useDispatch()
  const connectTimer = useRef(null)
  const { pathname } = useLocation()

  const handleClickConnect = () => {
    if (isInMobileWalletApp()) {
      connect()
    } else {
      setWalletModalVisible(true)
    }
  }

  const handleClose = () => {
    setWalletModalVisible(false)
  }

  const handleCopyAddress = () => {
    copy(address)
    dispatch(
      warmDialog({
        open: true,
        type: 'info',
        message: 'Copied'
      })
    )
  }

  const connectTo = async name => {
    if (!connectTimer.current) {
      connectTimer.current = setTimeout(() => {
        dispatch(
          warmDialog({
            open: true,
            type: 'warning',
            message: 'Please check you wallet info or confirm you have install the wallet'
          })
        )
        connectTimer.current = null
      }, 5000)
    }
    const provider = await connect(name).catch(error => {
      const msg = error?.message
      if (msg === 'No Web3 Provider found') {
        dispatch(
          warmDialog({
            open: true,
            type: 'warning',
            message: 'Please install the wallet first. If you have installed, reload page'
          })
        )
      }
      console.error(error)
    })
    clearTimeout(connectTimer.current)
    connectTimer.current = null
    if (provider) {
      handleClose()
    }
  }

  const dashboardUrlRender = () => {
    let nextChainId = CHAIN_ID || '1'
    let nextVault = pathname === '/ethi' ? 'ethi' : 'usdi'

    // If it's in ETHi, jump to eth chain
    if (nextVault === 'ethi') {
      nextChainId = '1'
    }
    return `${isMarketingHost() ? 'https://dashboard.bankofchain.io' : DASHBOARD_URL}/#/?chain=${nextChainId}&vault=${nextVault}`
  }

  const handleGoToAccount = () => dispatch(setCurrentTab(INVEST_TAB.account))

  return (
    <>
      <List className={classes.list} classes={{ root: classes.iii }}>
        <ListItem className={classes.listItem}>
          <Button color="transparent" href={'/'} className={classes.navLink}>
            Home
          </Button>
        </ListItem>
        <ListItem className={classes.listItem}>
          <Button color="transparent" target="_blank" href={dashboardUrlRender()} className={classes.navLink}>
            Dashboard
          </Button>
        </ListItem>
        <ListItem className={classes.listItem}>
          <Button color="transparent" target="_blank" href={DOCUMENT_URL} className={classes.navLink}>
            Docs
          </Button>
        </ListItem>
        {!POLYGON_HIDDEN && (
          <ListItem className={classes.listItem}>
            <CustomDropdown
              noLiPadding
              buttonText="Bridge"
              buttonProps={{
                className: classes.navLink,
                color: 'transparent'
              }}
              dropdownList={[
                <a
                  key="polygon-bridge"
                  target="_blank"
                  href="https://wallet.polygon.technology/bridge"
                  className={classes.dropdownLink}
                  rel="noopener noreferrer"
                >
                  Polygon Bridge
                </a>
              ]}
            />
          </ListItem>
        )}
        {CHAIN_SELECTOR_SHOW_ROUTER.includes(pathname) && (
          <ListItem className={classes.listItem}>
            <CustomDropdown
              noLiPadding
              buttonText={get(find(NET_WORKS, { chainId: CHAIN_ID }), 'name', 'Networks')}
              buttonProps={{
                className: classes.navLink,
                color: 'transparent'
              }}
              dropdownList={map(NET_WORKS, i => (
                <span onClick={() => props.changeNetwork(i)} className={classes.dropdownLink}>
                  {i.name}
                </span>
              ))}
            />
          </ListItem>
        )}
        {!isEmpty(LEGACYS) && (
          <ListItem className={classes.listItem}>
            <Button color="transparent" target="_blank" href={LEGACYS.url} className={classes.navLink}>
              {LEGACYS.title}
            </Button>
          </ListItem>
        )}
        {pathname === '/' ? (
          <ListItem className={classes.listItem}>
            <Button className={`${classes.navLink} ${classes.colorfulLink}`} color="colorfull-border" href="/#/usdi">
              Launch App
            </Button>
          </ListItem>
        ) : (
          <ListItem
            className={classNames(classes.listItem, {
              [classes.hidden]: isInMobileH5() || isInMobileWalletApp()
            })}
          >
            {isEmpty(userProvider) ? (
              <Button
                color="colorfull-border-2"
                target="_blank"
                className={`${classes.navLink} ${classes.colorfulLink}`}
                onClick={handleClickConnect}
              >
                Connect Wallet
              </Button>
            ) : isInMobileWalletApp() ? (
              <Button color="colorfull-border-2" target="_blank" className={`${classes.navLink} ${classes.colorfulLink}`} onClick={disconnect}>
                <Address size="short" address={address} />
              </Button>
            ) : (
              <CustomDropdown
                noLiPadding
                buttonText={() => <Address size="short" address={address} />}
                buttonProps={{
                  color: 'colorfull-border-2',
                  className: `${classes.navLink} ${classes.colorfulLink} ${classes.accountLink}`
                }}
                dropdownList={[
                  <div key="My Account" className={classes.dropdownLink} onClick={handleGoToAccount}>
                    <AccountBalanceWalletOutlinedIcon className={classes.dropdownLinkIcon} />
                    <span>My Account</span>
                  </div>,
                  <div key="Copy Addres" onClick={handleCopyAddress} className={classes.dropdownLink}>
                    <FileCopyOutlinedIcon className={classes.dropdownLinkIcon} />
                    <span>Copy Address</span>
                  </div>,
                  <div key="Change Wallet" onClick={handleClickConnect} className={classes.dropdownLink}>
                    <PaymentOutlinedIcon className={classes.dropdownLinkIcon} />
                    <span>Change Wallet</span>
                  </div>,
                  <div key="Disconnect" onClick={disconnect} className={classes.dropdownLink}>
                    <ExitToAppOutlinedIcon className={classes.dropdownLinkIcon} />
                    <span>Disconnect</span>
                  </div>
                ]}
              />
            )}
          </ListItem>
        )}
      </List>
      <WalletModal open={walletModalVisible} onClose={handleClose} connectTo={connectTo} selected={walletName} />
    </>
  )
}
