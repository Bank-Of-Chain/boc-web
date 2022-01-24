import React from "react"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// @material-ui/icons

// core components
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"

import styles from "./lendingStyle"

const useStyles = makeStyles(styles)

export default function LendingSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>
        Crypto Lending Interest Rates for <span className={classes.text}>January 2022</span>
      </h2>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <h2>lending sections</h2>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  )
}
