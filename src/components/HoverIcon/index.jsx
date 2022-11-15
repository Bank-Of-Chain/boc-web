import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style'

const useStyles = makeStyles(styles)

const HoverIcon = props => {
  const classes = useStyles()
  const { defaultIcon, hoverIcon } = props

  return (
    <span className={classes.logo}>
      <span>{defaultIcon}</span>
      <span className={classes.active}>{hoverIcon}</span>
    </span>
  )
}

export default HoverIcon
