import React, { Fragment } from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// nodejs library to set properties for components
import PropTypes from "prop-types"

// material-ui components
import { makeStyles } from "@material-ui/core/styles"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Icon from "@material-ui/core/Icon"
// core components
import CardBody from "../Card/CardBody"
import CardHeader from "../Card/CardHeader"

import styles from "./customTabsStyle"

const useStyles = makeStyles(styles)

export default function CustomTabs (props) {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, value) => {
    setValue(value)
  }
  const classes = useStyles()
  const { headerColor, plainTabs, tabs, title, rtlActive, centered } = props
  const cardTitle = classNames({
    [classes.cardTitle]: true,
    [classes.cardTitleRTL]: rtlActive,
  })
  return (
    <Fragment>
      <Tabs
        centered={centered}
        value={value}
        onChange={handleChange}
        classes={{
          root: classes.tabsRoot,
          indicator: classes.displayNone,
        }}
      >
        {tabs.map((prop, key) => {
          var icon = {}
          if (prop.tabIcon) {
            icon = {
              icon: typeof prop.tabIcon === "string" ? <Icon>{prop.tabIcon}</Icon> : <prop.tabIcon />,
            }
          }
          return (
            <Tab
              classes={{
                root: classes.tabRootButton,
                label: classes.tabLabel,
                selected: classes.tabSelected,
                wrapper: classes.tabWrapper,
              }}
              key={key}
              label={prop.tabName}
              {...icon}
            />
          )
        })}
      </Tabs>
      {tabs.map((prop, key) => {
        if (key === value) {
          return <div key={key}>{prop.tabContent}</div>
        }
        return null
      })}
    </Fragment>
  )
}


