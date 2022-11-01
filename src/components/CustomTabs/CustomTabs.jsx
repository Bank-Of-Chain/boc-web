import React, { Fragment, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Icon from '@material-ui/core/Icon'

import styles from './customTabsStyle'

const useStyles = makeStyles(styles)

export default function CustomTabs(props) {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, value) => {
    setValue(value)
    props.onChange(event, value)
  }
  const classes = useStyles()
  const { tabs, centered, size } = props

  useEffect(() => {
    setValue(props.value)
  }, [props.value])

  return (
    <Fragment>
      <Tabs
        centered={centered}
        value={value}
        onChange={handleChange}
        classes={{
          root: classes.tabsRoot,
          indicator: classes.displayNone
        }}
      >
        {tabs.map((prop, key) => {
          var icon = {}
          if (prop.tabIcon) {
            icon = {
              icon: typeof prop.tabIcon === 'string' ? <Icon>{prop.tabIcon}</Icon> : <prop.tabIcon />
            }
          }
          return (
            <Tab
              classes={{
                root: size === 'small' ? classes.tabSmallButton : classes.tabRootButton,
                label: classes.tabLabel,
                selected: classes.tabSelected,
                wrapper: classes.tabWrapper
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
