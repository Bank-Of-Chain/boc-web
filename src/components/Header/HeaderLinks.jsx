/*eslint-disable*/
import React from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

// @material-ui/icons
import AccountBalanceWallet from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceWalletOutlined from "@material-ui/icons/AccountBalanceWalletOutlined";
import Apps from "@material-ui/icons/Apps";
import BookIcon from '@material-ui/icons/Book';
import ChatIcon from '@material-ui/icons/Chat';
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";

// core components
import { Link } from "react-router-dom";
import Button from "../CustomButtons/Button";
import styles from "./headerLinksStyle";
import Address from "../Address/Address";
import CustomDropdown from "../CustomDropdown/CustomDropdown";

// === Utils === //
import isEmpty from "lodash/isEmpty";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const { address, userProvider, loadWeb3Modal, logoutOfWeb3Modal } = props;
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/zh/docs/"
          className={classes.navLink}
        >
          <LibraryBooksIcon className={classes.icons} ></LibraryBooksIcon> Document
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/zh/community/"
        >
          <ChatIcon className={classes.icons} ></ChatIcon> DAO
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/zh/blog/"
        >
          <BookIcon className={classes.icons} ></BookIcon> Blog
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <CustomDropdown
          noLiPadding
          buttonText="Networks"
          buttonProps={{
            className: classes.navLink,
            color: "transparent",
          }}
          buttonIcon={Apps}
          dropdownList={[
            <Link to="/" className={classes.dropdownLink}>
              ETH
            </Link>,
            <Link to="/invest" className={classes.dropdownLink}>
              Polygon
            </Link>
          ]}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        {
          isEmpty(userProvider)
            ? <Button
              color="colorfull"
              target="_blank"
              className={classes.navLink}
              onClick={loadWeb3Modal}
            >
              <AccountBalanceWallet className={classes.icons} ></AccountBalanceWallet> Launch App
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
    </List>
  );
}
