/*eslint-disable*/
import React, { useState } from "react"

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
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';

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
import { isInMobileWalletApp } from "../../helpers/plugin-util"

// === Constants === //
import { NET_WORKS, DASHBOARD_URL, DOCUMENT_URL, CHAIN_ID } from "./../../constants"

const CHAIN_SELECTOR_SHOW_ROUTER = ['#/mutils']

const useStyles = makeStyles(styles)
export default function HeaderLinks (props) {
  const { address, userProvider, connect, disconnect, walletName } = props
  const [walletModalVisible, setWalletModalVisible] = useState(false)
  const classes = useStyles()

  const handleClickConnect = () => {
    if (isInMobileWalletApp) {
      connect()
    } else {
      setWalletModalVisible(true)
    }
  }

  const handleClose = () => {
    setWalletModalVisible(false)
  }

  const connectTo = async (name, chainId) => {
    const provider = await connect(name, chainId)
    if (provider) {
      handleClose()
    }
  }

  const dashboardUrlRender = () => {
    let nextChainId = CHAIN_ID
    //TODO: 先默认都跳转usdi
    let nextVault = window.location.hash === '#/ethi' ? 'usdi' : 'usdi'

    // 如果是ethi模块，则必须跳转eth链
    if(nextVault === 'ethi') {
      nextChainId = 1
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
                Binance Bridge
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
        {location.hash === "#/" ? (
          <ListItem className={classes.listItem}>
            <Button className={`${classes.navLink} ${classes.colorfulLink}`} color='colorfull' size='lg' href='/#/mutils'>
              <AccountBalanceWallet className={classes.icons}></AccountBalanceWallet> Launch App
              </Button>
            </ListItem>
          ) : (
          <ListItem className={classes.listItem}>
            {isEmpty(userProvider) ? (
              <Button
                color='colorfull'
                target='_blank'
                className={`${classes.navLink} ${classes.colorfulLink}`}
                onClick={handleClickConnect}
              >
                <AccountBalanceWallet className={classes.icons}></AccountBalanceWallet> Connect wallet
              </Button>
            ) : isInMobileWalletApp
              ? (
                <Button color='transparent' target='_blank' className={classes.navLink} onClick={disconnect}>
                  <AccountBalanceWalletOutlined className={classes.icons} /> <Address size='short' address={address} />
                </Button>
              )
              : (
                <CustomDropdown
                  noLiPadding
                  buttonText={() => <Address size='short' address={address} />}
                  buttonProps={{
                    className: classes.navLink,
                    color: "transparent",
                  }}
                  buttonIcon={() => <AccountBalanceWalletOutlined className={classes.icons} />}
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
