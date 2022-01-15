import React from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// @material-ui/icons

// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
import Button from "../../components/CustomButtons/Button"
import Parallax from "../../components/Parallax/Parallax"
import Chains from "../../components/Chains/Chains"

import styles from "./landingPage"

// === Constants === //
import { NET_WORKS } from "./../../constants"

// Sections for this page
import ProductSection from "./Sections/ProductSection"
import AuditedSection from "./Sections/AuditedSection"

const useStyles = makeStyles(styles)

export default function Home (props) {
  const { changeNetwork } = props
  const classes = useStyles()

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Parallax filter>
          <div className={classes.container}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} style={{ textAlign: "center" }}>
                <h1 className={classes.title}>The Multichain Yield Optimizer</h1>
                <br />
                <br />
                <Button color='colorfull' size='lg' href='/#/invest'>
                  go inverst
                </Button>
                <br />
                <br />
                <Chains array={NET_WORKS} handleClick={changeNetwork} />
              </GridItem>
            </GridContainer>
          </div>
        </Parallax>
        <div className={classNames(classes.main, classes.mainRaised)}>
          <div className={classes.container}>
            <ProductSection />
            <AuditedSection />
          </div>
        </div>
      </GridItem>
    </GridContainer>
  )
}
