import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const HeartBeet = props => {
  const { size = '16px' } = props
  const classes = useStyles()
  return (
    <div className={classes.heart} style={{ height: size, width: size }}>
      <div className={classes.heartBefore}></div>
      <div className={classes.heartAfter}></div>
    </div>
  )
}

export default HeartBeet
