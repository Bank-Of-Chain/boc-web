import React from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
import Template from "./Template/index"

// === constants === //
import {
  VAULTS,
} from "../../constants"

// === Utils === //
import map from "lodash/map"

// === Styles === //
import styles from "./style"

const useStyles = makeStyles(styles)

// vaults 不同的版本使用不同的模板
const TEMPLATE_MAP = {
  "beta-v1.5": props => <Template {...props} />,
  "v4.6": props => <Template {...props} />,
}

export default function Vaults () {
  const classes = useStyles()
  const vaults = map(VAULTS, i => {
    const { path, abi_version } = i
    return (
      <GridItem key={path} xs={6} sm={6} md={4} className={classNames(classes.centerItem)}>
        {TEMPLATE_MAP[abi_version](i)}
      </GridItem>
    )
  })

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>{vaults}</GridContainer>
      </div>
    </div>
  )
}
