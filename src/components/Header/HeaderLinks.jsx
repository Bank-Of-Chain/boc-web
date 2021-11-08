/*eslint-disable*/
import React from "react";
import IconButton from "@material-ui/core/IconButton";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

// @material-ui/icons
import Settings from "@material-ui/icons/Settings";
import AccountBalanceWallet from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceWalletOutlined from "@material-ui/icons/AccountBalanceWalletOutlined";

// core components
import Button from "../CustomButtons/Button";
import styles from "./headerLinksStyle";
import Address from "../Address/Address";

// === Utils === //
import isEmpty from "lodash/isEmpty";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const { address, injectedProvider, loadWeb3Modal, logoutOfWeb3Modal } = props;
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        {
          isEmpty(injectedProvider)
            ? <Button
              color="transparent"
              target="_blank"
              className={classes.navLink}
              onClick={loadWeb3Modal}
            >
              <AccountBalanceWallet className={classes.icons} ></AccountBalanceWallet> Conect
            </Button>
            : <Button
              color="transparent"
              target="_blank"
              className={classes.navLink}
              onClick={logoutOfWeb3Modal}
            >
              <AccountBalanceWalletOutlined className={classes.icons} /> <Address size="short" address={address} />
            </Button>
        }
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          href=""
          color="transparent"
          target="_blank"
          className={classes.navLink}
        >
          <Settings className={classes.icons} />
        </Button>
      </ListItem>
    </List>
  );
}
