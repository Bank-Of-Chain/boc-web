import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Styles === //
import styles from './description-style'

const useStyles = makeStyles(styles)

const Description = props => {
  const classes = useStyles()
  const { title = '', content = '', horizontal = false } = props
  return (
    <div className={horizontal ? classes.bodyItemHorizontal : classes.bodyItem}>
      <div className={classes.bodyItemTitle}>{title}</div>
      <div className={horizontal ? classes.contentHorizontal : classes.content}>{content}</div>
    </div>
  )
}

export default Description
