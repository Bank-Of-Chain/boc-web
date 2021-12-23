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
import Transform from '@material-ui/icons/Transform';
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
import get from "lodash/get";
import find from "lodash/find";
import map from "lodash/map";

// === Constants === //
import { COMMUNITY_URL, BLOG_URL, DOCUMENT_URL, NET_WORKS } from "./../../constants";

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
          buttonText="Bridge"
          buttonProps={{
            className: classes.navLink,
            color: "transparent",
          }}
          buttonIcon={Transform}
          dropdownList={[
            <a target="_blank" href="https://wallet.polygon.technology/bridge" className={classes.dropdownLink}>
              Polygon Bridge
            </a>,
            <a target="_blank" href="https://www.binance.org/en/bridge" className={classes.dropdownLink}>
              Binance Bridge
            </a>
          ]}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <CustomDropdown
          noLiPadding
          buttonText={get(find(NET_WORKS, { chainId: props.localChainId }), 'name', 'Networks')}
          buttonProps={{
            className: classes.navLink,
            color: "transparent",
          }}
          buttonIcon={Apps}
          dropdownList={map(NET_WORKS, i => (
            <p onClick={() => props.changeNetwork(i)} className={classes.dropdownLink}>
              {i.name}
            </p>
          ))}
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
