import React from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
import { TemplateForUSDi, TemplateForETHi} from "./Template"

// === constants === //
import { VAULTS } from "../../constants"

// === Utils === //
import map from "lodash/map"
import get from "lodash/get"
import noop from "lodash/noop"

// === Styles === //
import styles from "./style"

const useStyles = makeStyles(styles)

// vaults 不同的版本使用不同的模板
const TEMPLATE_MAP = {
  //TODO: V1.1 has no template for it
  // invest: props => <Template {...props} />,
  ethi: props => <TemplateForETHi {...props} />,
  mutilCoins: props => <TemplateForUSDi {...props} />,
}

export default function Vaults (props) {
  const classes = useStyles()
  const vaults = map(VAULTS, i => {
    const { path, id, isOpen } = i
    if (isOpen) {
      return (
        <GridItem key={path} xs={12} sm={12} md={12} className={classNames(classes.centerItem)}>
          {get(TEMPLATE_MAP, id, noop)({ ...props, ...i })}
        </GridItem>
      )
    }
  })

  return (
    <div className={classNames(classes.main, classes.mainRaised)}>
      <div className={classes.container}>
        <GridContainer className={classNames(classes.center)}>{vaults}</GridContainer>
      </div>
    </div>
  )
}
