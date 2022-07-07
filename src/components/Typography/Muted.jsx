import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import styles from "./typographyStyle";

const useStyles = makeStyles(styles);

export default function Muted(props) {
  const classes = useStyles();
  const { children, className, title } = props;
  return (
    <div
      className={classNames(
        classes.defaultFontStyle,
        classes.mutedText,
        className
      )}
      title={title}
    >
      {children}
    </div>
  );
}

Muted.propTypes = {
  children: PropTypes.node,
};
