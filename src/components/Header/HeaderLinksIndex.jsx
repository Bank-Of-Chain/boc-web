/*eslint-disable*/
import React from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

// @material-ui/icons
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import Apps from "@material-ui/icons/Apps";
import BookIcon from '@material-ui/icons/Book';
import ChatIcon from '@material-ui/icons/Chat';
import AccountBalanceWallet from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceWalletOutlined from "@material-ui/icons/AccountBalanceWalletOutlined";
// core components
import { Link } from "react-router-dom";
import Button from "../CustomButtons/Button";
import CustomDropdown from "../CustomDropdown/CustomDropdown";
import styles from "./headerLinksStyle";
import Address from "../Address/Address";

// === Utils === //
import isEmpty from "lodash/isEmpty";

// === Constants === //
import { COMMUNITY_URL, BLOG_URL, DOCUMENT_URL } from "./../../constants";

const useStyles = makeStyles(styles);

export default function HeaderLinksIndex(props) {
  const { address, userProvider, loadWeb3Modal } = props;
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href={DOCUMENT_URL}
          className={classes.navLink}
        >
          <LibraryBooksIcon className={classes.icons} ></LibraryBooksIcon> Document
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href={COMMUNITY_URL}
        >
          <ChatIcon className={classes.icons} ></ChatIcon> DAO
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href={BLOG_URL}
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
              className={classes.navLink}
              href="/#/invest"
            >
              <AccountBalanceWalletOutlined className={classes.icons} /> <Address size="short" address={address} />
            </Button>
        }
      </ListItem>
    </List>
  );
}
