import React from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Constants === //
import { NET_WORKS } from "./../../constants"

// === Components === //
import ProductSection from "./Sections/ProductSection"
import AuditedSection from "./Sections/AuditedSection"
import AmmSection from "./Sections/AmmSection"
import LendingSection from "./Sections/LendingSection"
import RoadMapSection from "./Sections/RoadMapSection"
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
        <GridItem xs={12} sm={12} md={12} className={classes.grid}>
          <h1 className={classes.title}>The Multichain</h1>
          <h1 className={classes.title}>Yield Optimizer</h1>
          <h4 className={classes.text} style={{ marginTop: 40 }}>BOC is a DeFi protocol that</h4>
          <h4 className={classes.text}>
            provides the best long-term
            <b> risk-free </b>
            return
          </h4>
          <p className={classes.text} style={{ marginTop: 40 }}>
            <Button className={classes.invest} color='colorfull-border' size='sm' href='/#/mutils'>
              Launch app
            </Button>
          </p>
        </GridItem>
      </GridContainer>
      <LendingSection />
      <ProductSection />
      <AmmSection />
      <RoadMapSection />
      <AuditedSection />
    </div>
  )
}
