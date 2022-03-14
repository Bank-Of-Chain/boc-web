import React from "react"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import Amms from "../../../components/Amms/index"

import styles from "./ammStyle"

const useStyles = makeStyles(styles)

export default function AmmSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Integrated with the major chains, stablecoins, and AMMs </h2>
      <Amms />
    </div>
  )
}
