import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";

// === Components === //
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import HeaderLinks from "@/components/Header/HeaderLinks";

import styles from "./style";

const useStyles = makeStyles(styles);

export default function Frame(props) {
  const classes = useStyles();
  return (
    <Fragment>
      <Header
        color="transparent"
        brand="Bank Of Chain"
        rightLinks={<HeaderLinks {...props} />}
        fixed
        changeColorOnScroll={{
          height: 90,
          color: "white",
        }}
        {...props}
      />
      <main className={classes.main}>{props.children}</main>
      <Footer whiteFont />
    </Fragment>
  );
}
