/*eslint-disable*/
import React from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

// @material-ui/icons
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import Apps from "@material-ui/icons/Apps";
import BookIcon from '@material-ui/icons/Book';
import ChatIcon from '@material-ui/icons/Chat';
// core components
import { Link } from "react-router-dom";
import Button from "../CustomButtons/Button";
import CustomDropdown from "../CustomDropdown/CustomDropdown";
import styles from "./headerLinksStyle";


const useStyles = makeStyles(styles);

export default function HeaderLinksIndex(props) {
  const classes = useStyles();
  return (
    <List className={classes.list}>
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
            ,
          ]}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/Community"
        >
          <ChatIcon className={classes.icons} ></ChatIcon> DAO
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/Blog"
        >
          <BookIcon className={classes.icons} ></BookIcon> Blog
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          href="https://piggyfinance.github.io/docs/"
          className={classes.navLink}
        >
          <LibraryBooksIcon className={classes.icons} ></LibraryBooksIcon> Document
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="colorfull"
          href="/#/invest"
        >
          <TrendingUpIcon className={classes.icons} ></TrendingUpIcon> Launch App
        </Button>
      </ListItem>
    </List>
  );
}
