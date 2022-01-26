import React from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Constants === //
import { NET_WORKS } from "./../../constants"

// === Components === //
import ProductSection from "./Sections/ProductSection"
import AuditedSection from "./Sections/AuditedSection"
import AmmSection from "./Sections/AmmSection"
import TvlSection from "./Sections/TvlSection"
import LendingSection from "./Sections/LendingSection"
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
import Button from "../../components/CustomButtons/Button"
import Chains from "../../components/Chains/Chains"

// === Styles === //
import styles from "./landingPage"

const useStyles = makeStyles(styles)

export default function Home (props) {
  const { changeNetwork } = props
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} style={{ textAlign: "left" }}>
          <h1 className={classes.title}>The Multichain Yield Optimizer</h1>
          <h4 className={classes.text}>BOC is a Defi protocol that provides the best long-term ‘risk-free’ return in USD (compared to other protocols).</h4>
          <div className={classes.earth}>
            <Button className={classes.inverst} color='colorfull' size='lg' href='/#/invest'>
              inverst
            </Button>
            <Chains
              maskStyle={{ display: "inline-block", paddingLeft: 10 }}
              array={NET_WORKS}
              handleClick={changeNetwork}
            />
            <TvlSection />
          </div>
        </GridItem>
      </GridContainer>
      <ProductSection />
      <AmmSection />
      <LendingSection />
      <AuditedSection />
    </div>
  )
}
