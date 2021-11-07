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

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const { address } = props;
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        {
          !address
            ? <Button
              href=""
              color="transparent"
              target="_blank"
              className={classes.navLink}
            >
              <AccountBalanceWallet className={classes.icons} ></AccountBalanceWallet> Conect
            </Button>
            : <Button
              href=""
              color="transparent"
              target="_blank"
              className={classes.navLink}
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
