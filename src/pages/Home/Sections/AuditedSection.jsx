import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import styles from "./auditedStyle";

const useStyles = makeStyles(styles);

export default function TeamSection() {
  const classes = useStyles();
  const isLayoutSm = useMediaQuery("(max-width: 960px)");
  return (
    <div className={isLayoutSm ? classes.sectionMobile : classes.section}>
      <h1 className={classes.title}>Your assets,</h1>
      <h1 className={classes.title}>secured</h1>
      <div className={classes.divider}></div>
      <h4 className={classes.text}>
        The smart contracts underlying the BoC protocol have been throughly and
        repeatedly tested. BoC has been audited by reputable security firms
        including XXXXXXXXXX, YYYYYYYYYYY and ZZZZZZZZZZZZZZZ.
      </h4>
    </div>
  );
}
