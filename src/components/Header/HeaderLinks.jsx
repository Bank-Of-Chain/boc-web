/*eslint-disable*/
import React from "react"

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

// === Utils === //
import isEmpty from "lodash/isEmpty"
import map from "lodash/map"
import get from "lodash/get"
import find from "lodash/find"
import { hasWalletInstalled } from "./../../helpers/plugin-util"

// === Constants === //
import { NET_WORKS, DASHBOARD_URL, DOCUMENT_URL, CHAIN_ID } from "./../../constants"

const useStyles = makeStyles(styles)
export default function HeaderLinks (props) {
  const { address, userProvider, loadWeb3Modal, logoutOfWeb3Modal } = props
  const classes = useStyles()
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button color='transparent' target='_blank' href={DOCUMENT_URL} className={classes.navLink}>
          <LibraryBooksIcon className={classes.icons}></LibraryBooksIcon> DOCS
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button color='transparent' target='_blank' href={`${DASHBOARD_URL}/#/?chain=${CHAIN_ID}&vault=${ window.location.hash === '#/ethi' ? 'ethi' : 'usdi' }`} className={classes.navLink}>
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
      <ListItem className={classes.listItem}>
        <CustomDropdown
          noLiPadding
          buttonText={get(find(NET_WORKS, { chainId: props.selectedChainId }), "name", "Networks")}
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
      {location.hash === "#/" ? (
        <ListItem className={classes.listItem}>
          <Button className={`${classes.navLink} ${classes.colorfulLink}`} color='colorfull' size='lg' href='/#/mutils'>
            <AccountBalanceWallet className={classes.icons}></AccountBalanceWallet> Launch App
          </Button>
        </ListItem>
      ) : (
        <ListItem className={classes.listItem}>
          {isEmpty(userProvider) ? (
            hasWalletInstalled() &&
            <Button
              color='colorfull'
              target='_blank'
              className={`${classes.navLink} ${classes.colorfulLink}`}
              onClick={loadWeb3Modal}
            >
              <AccountBalanceWallet className={classes.icons}></AccountBalanceWallet> Connect wallet
            </Button>
          ) : (
            <Button color='transparent' target='_blank' className={classes.navLink} onClick={logoutOfWeb3Modal}>
              <AccountBalanceWalletOutlined className={classes.icons} /> <Address size='short' address={address} />
            </Button>
          )}
        </ListItem>
      )}
    </List>
  )
}
