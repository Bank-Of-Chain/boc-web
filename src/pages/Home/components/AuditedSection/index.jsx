import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import styles from './auditedStyle'

const useStyles = makeStyles(styles)

export default function TeamSection() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  return (
    <div className={isLayoutSm ? classes.sectionMobile : classes.section}>
      <h1 className={classes.title}>Your assets,</h1>
      <h1 className={classes.title}>secured</h1>
      <div className={classes.divider}></div>
      <h4 className={classes.text}>
        The underlying smart contracts of the BoC protocol have been thoroughly and repeatedly tested. BoC contracts are currently under our first
        third-party audit.
      </h4>
    </div>
  )
}
