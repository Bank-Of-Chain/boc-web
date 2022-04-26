import React from "react"
import { makeStyles } from "@material-ui/core/styles"

import Card from "@material-ui/core/Card"

// === Styles === //
import styles from "./style"
const useStyles = makeStyles(styles)

export default function Template (props) {
  const classes = useStyles()
  const { path, abi_version, vault_address } = props

  return (
    <Card className={classes.card}>
      <a href={path} style={{ color: "#fff" }}>
        <p>go router: {path}</p>
        <p>abi version: {abi_version}</p>
        <p>vault address: {vault_address}</p>
      </a>
    </Card>
  )
}
