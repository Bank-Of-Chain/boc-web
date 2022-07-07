import React from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import styles from "./style";

const useStyles = makeStyles(styles);

export default function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      className={classNames(classes.tabPanel, {
        [classes.hidden]: value !== index,
      })}
      {...other}
    >
      {children}
    </div>
  );
}
