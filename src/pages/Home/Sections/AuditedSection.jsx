import React from "react"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

import styles from "./auditedStyle"

const useStyles = makeStyles(styles)

export default function TeamSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Audited And Verified</h2>
      <div className={classes.container}>
        <h2 className={classes.text}>
          <img className={classes.img} src={require("./../images/un-audit.png")} alt=''></img>This audit is in the
          testing phase...
        </h2>
      </div>
    </div>
  )
}
