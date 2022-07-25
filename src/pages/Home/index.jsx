import React from "react";
import { makeStyles } from "@material-ui/core/styles";

// === Components === //
import ProductSection from "./Sections/ProductSection";
import AuditedSection from "./Sections/AuditedSection";
import AmmSection from "./Sections/AmmSection";
import YieldSection from "./Sections/YieldSection";
import LendingSection from "./Sections/LendingSection";
import RoadMapSection from "./Sections/RoadMapSection";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Button from "../../components/CustomButtons/Button";

// === Styles === //
import styles from "./landingPage";

const useStyles = makeStyles(styles);

export default function Home(props) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} className={classes.grid}>
          <h1 className={classes.title}>The Multichain</h1>
          <h1 className={classes.title}>Yield Optimizer</h1>
          <h4 className={classes.text} style={{ marginTop: 40 }}>
            BOC is a DeFi protocol that
          </h4>
          <h4 className={classes.text}>
            provides the best long-term
            <b> risk-free </b>
            return
          </h4>
          <p className={classes.text} style={{ marginTop: 40 }}>
            <Button
              className={classes.invest}
              color="colorfull-border"
              size="sm"
              href="/#/mutils"
            >
              Launch App
            </Button>
          </p>
        </GridItem>
      </GridContainer>
      <LendingSection />
      <ProductSection />
      <YieldSection />
      <AmmSection />
      <RoadMapSection />
      <AuditedSection />
    </div>
  );
}
