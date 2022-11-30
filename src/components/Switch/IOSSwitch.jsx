import React from 'react'
import { withStyles } from '@material-ui/core/styles'

// === Components === //
import Switch from '@material-ui/core/Switch'
import classNames from 'classnames'

const IOSSwitch = withStyles(theme => ({
  root: {
    width: 42,
    height: 18,
    padding: 0,
    margin: theme.spacing(1)
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(23px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#CABBFF',
        opacity: 1,
        border: 'none'
      }
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff'
    }
  },
  switchBaseUsdi: {
    backgroundColor: '#7E6DD2',
    '&$checked': {
      '& + $track': {
        backgroundColor: '#7E6DD2'
      }
    }
  },
  thumb: {
    width: '1rem',
    height: '1rem'
  },
  track: {
    border: 'none',
    borderRadius: 26 / 2,
    backgroundColor: '#BEBEBE',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border'])
  },
  checked: {},
  focusVisible: {}
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classNames(classes.switchBase, { [classes.switchBaseUsdi]: props.isUsdi }),
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  )
})

export default IOSSwitch
