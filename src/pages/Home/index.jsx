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
  const { ...rest } = props;

  return (
    <div>
      <Header
        color="transparent"
        routes={dashboardRoutes}
        brand="Piggy.Finance"
        rightLinks={<HeaderLinksIndex />}
        fixed
        changeColorOnScroll={{
          height: 400,
          color: "white",
        }}
        {...rest}
      />
      <Parallax filter image={require("./images/landing-bg.jpg")}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={6}>
              <h1 className={classes.title}>Your Story Starts With Us.</h1>
              <h4 className={classes.text}>
                30w+投资者、5200W+锁仓资金
              </h4>
              <br />
              <Button
                color="danger"
                size="lg"
                href="http://www.baidu.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-play" />
                Watch video
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
      <Footer />
    </div>
  );
}
