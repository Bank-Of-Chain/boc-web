/*eslint-disable*/
import React from "react";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

// @material-ui/icons
import Settings from "@material-ui/icons/Settings";
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
 

// core components
import Button from "../CustomButtons/Button";
import styles from "./headerLinksStyle";


const useStyles = makeStyles(styles);

export default function HeaderLinksIndex(props) {
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          href="/#/invest"
          className={classes.navLink}
        >
          <TrendingUpIcon className={classes.icons} ></TrendingUpIcon> Invest
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          target="_blank"
          className={classes.navLink}
        >
          <LibraryBooksIcon className={classes.icons} ></LibraryBooksIcon> Document
        </Button>
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
