import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons

// core components
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Button from "../../components/CustomButtons/Button";
import Parallax from "../../components/Parallax/Parallax";
import HeaderLinksIndex from "../../components/Header/HeaderLinksIndex";

import styles from "./landingPage";

// Sections for this page
import ProductSection from "./Sections/ProductSection";
import TeamSection from "./Sections/TeamSection";

const dashboardRoutes = [];

const useStyles = makeStyles(styles);

export default function Home(props) {
  const classes = useStyles();

  return (
    <div>
      <Header
        color="transparent"
        routes={dashboardRoutes}
        brand="Bank Of Chain"
        rightLinks={<HeaderLinksIndex />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
      />
      <Parallax filter>
        <div className={classes.container}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
              <h1 className={classes.title}>The Multichain Yield Optimizer</h1>
              <h4 className={classes.text}>
                3w+优秀投资者、5200W+锁仓资金
              </h4>
              <br />
              <Button
                color="colorfull"
                size="lg"
                href="/#/invest"
              >
                Launch App
              </Button>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <ProductSection />
          <TeamSection />
        </div>
      </div>
      <Footer whiteFont />
    </div>
  );
}
