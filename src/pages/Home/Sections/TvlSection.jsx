import React from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"

import styles from "./tvlStyle"

const useStyles = makeStyles(styles)

export default function TvlSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <GridContainer>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.title}>$ 204242.1</p>
              <p className={classes.subTitle}>TVL</p>
            </GridItem>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.title}>$ 567.3m</p>
              <p className={classes.subTitle}>TOTAL REVENUE</p>
            </GridItem>
          </GridContainer>
          <GridContainer>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.title}>118m CRV</p>
              <p className={classes.subTitle}>TOTAL CRV EARNED</p>
            </GridItem>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.title}>9.2 %</p>
              <p className={classes.subTitle}>% OF CVXLOCKED</p>
            </GridItem>
          </GridContainer>
        </GridItem>
      </GridContainer>
    </div>
  )
}
