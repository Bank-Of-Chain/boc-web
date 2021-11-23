import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons

// core components
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";

import styles from "./auditedStyle";

const useStyles = makeStyles(styles);

export default function TeamSection() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Audited And Verified</h2>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <h2 className={classes.text}>Coming soon</h2>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
