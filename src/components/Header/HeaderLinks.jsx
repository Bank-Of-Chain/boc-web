/*eslint-disable*/
import React, { useState, useRef } from "react"
import classNames from "classnames";
import { useDispatch } from "react-redux"
import { warmDialog } from "../../reducers/meta-reducer"

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"

// @material-ui/icons
import AccountBalanceWallet from "@material-ui/icons/AccountBalanceWallet"
import AccountBalanceWalletOutlined from "@material-ui/icons/AccountBalanceWalletOutlined"
import Apps from "@material-ui/icons/Apps"
import Transform from "@material-ui/icons/Transform"
import InsertChartIcon from "@material-ui/icons/InsertChart"
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks"
import ClearAllIcon from '@material-ui/icons/ClearAll';

// core components
import Button from "../CustomButtons/Button"
import styles from "./headerLinksStyle"
import Address from "../Address/Address"
import CustomDropdown from "../CustomDropdown/CustomDropdown"
import WalletModal from "../WalletModal"

// === Utils === //
import isEmpty from "lodash/isEmpty"
import map from "lodash/map"
import get from "lodash/get"
import find from "lodash/find"
import { isInMobileWalletApp, isInMobileH5 } from "../../helpers/plugin-util"

// === Constants === //
import { NET_WORKS, DASHBOARD_URL, DOCUMENT_URL, CHAIN_ID, LEGACYS } from "./../../constants"

const CHAIN_SELECTOR_SHOW_ROUTER = ['#/mutils']

const useStyles = makeStyles(styles)
export default function HeaderLinks (props) {
  const { address, userProvider, connect, disconnect, walletName } = props
  const [walletModalVisible, setWalletModalVisible] = useState(false)
  const classes = useStyles()
  const dispatch = useDispatch()
  const connectTimer = useRef(null)

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

  const connectTo = async (name) => {
    if (!connectTimer.current) {
      connectTimer.current = setTimeout(() => {
        dispatch(warmDialog({
          open: true,
          type: "warning",
          message: "Please check you wallet info or confirm you have install the wallet",
        }))
        connectTimer.current = null
      }, 5000)
    }
    const provider = await connect(name).catch((error) => {
      const msg = error?.message
      if (msg === 'No Web3 Provider found') {
        dispatch(warmDialog({
          open: true,
          type: "warning",
          message: "Please install the wallet first. If you have installed, reload page",
        }))
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
    let nextVault = window.location.hash === '#/ethi' ? 'ethi' : 'usdi'

    // 如果是ethi模块，则必须跳转eth链
    if(nextVault === 'ethi') {
      nextChainId = '1'
    }
    return `${DASHBOARD_URL}/#/?chain=${nextChainId}&vault=${nextVault}`
  }

  return (
    <>
      <List className={classes.list}>
        <ListItem className={classes.listItem}>
          <Button color='transparent' target='_blank' href={DOCUMENT_URL} className={classes.navLink}>
            <LibraryBooksIcon className={classes.icons}></LibraryBooksIcon> DOCS
          </Button>
        </ListItem>
        <ListItem className={classes.listItem}>
          <Button color='transparent' target='_blank' href={dashboardUrlRender()} className={classes.navLink}>
            <InsertChartIcon className={classes.icons}></InsertChartIcon> Dashboard
          </Button>
        </ListItem>
        <ListItem className={classes.listItem}>
          <CustomDropdown
            noLiPadding
            buttonText='Bridge'
            buttonProps={{
              className: classes.navLink,
              color: "transparent",
            }}
            buttonIcon={Transform}
            dropdownList={[
              <a target='_blank' href='https://wallet.polygon.technology/bridge' className={classes.dropdownLink}>
                Polygon Bridge
              </a>,
              <a target='_blank' href='https://www.binance.org/en/bridge' className={classes.dropdownLink}>
                BNB Bridge
              </a>,
            ]}
          />
        </ListItem>
        {
          CHAIN_SELECTOR_SHOW_ROUTER.includes(window.location.hash) && <ListItem className={classes.listItem}>
            <CustomDropdown
              noLiPadding
              buttonText={get(find(NET_WORKS, { chainId: CHAIN_ID }), "name", "Networks")}
              buttonProps={{
                className: classes.navLink,
                color: "transparent",
              }}
              buttonIcon={Apps}
              dropdownList={map(NET_WORKS, i => (
                <a onClick={() => props.changeNetwork(i)} className={classes.dropdownLink}>
                  {i.name}
                </a>
              ))}
            />
          </ListItem>
        }
        {
        !isEmpty(LEGACYS) && <ListItem className={classes.listItem}>
          <Button color='transparent' target='_blank' href={LEGACYS.url} className={classes.navLink}>
            <ClearAllIcon className={classes.icons}></ClearAllIcon> {LEGACYS.title}
          </Button>
        </ListItem>
        }
        {location.hash === "#/" ? (
          <ListItem className={classes.listItem}>
            <Button className={`${classes.navLink} ${classes.colorfulLink}`} color='colorfull-border' href='/#/mutils'>
               Launch App
            </Button>
            </ListItem>
          ) : (
          <ListItem className={classNames(classes.listItem, { [classes.hidden]: isInMobileH5() || isInMobileWalletApp() })}>
            {isEmpty(userProvider) ? (
              <Button
                color='colorfull-border-2'
                target='_blank'
                className={`${classes.navLink} ${classes.colorfulLink}`}
                onClick={handleClickConnect}
              >
                Connect Wallet
              </Button>
            ) : isInMobileWalletApp()
              ? (
                <Button color="colorfull-border-2" target='_blank'  className={`${classes.navLink} ${classes.colorfulLink}`} onClick={disconnect}>
                  <Address size='short' address={address} />
                </Button>
              )
              : (
                <CustomDropdown
                  noLiPadding
                  buttonText={() => <Address size='short' address={address} />}
                  buttonProps={{
                    color: "colorfull-border-2",
                    className: `${classes.navLink} ${classes.colorfulLink}`,
                  }}
                  dropdownList={[
                    <a onClick={handleClickConnect} className={classes.dropdownLink}>
                      Change Wallet
                    </a>,
                    <a onClick={disconnect} className={classes.dropdownLink}>
                      Disconnect
                    </a>
                  ]}
                />
              )
            }
          </ListItem>
        )}
      </List>
      <WalletModal
        open={walletModalVisible}
        onClose={handleClose}
        connectTo={connectTo}
        selected={walletName}
      />
    </>
  )
}
