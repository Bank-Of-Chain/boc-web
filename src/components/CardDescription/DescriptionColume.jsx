import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Styles === //
import styles from './decription-colume-style'

const useStyles = makeStyles(styles)

const DescriptionColume = props => {
  const classes = useStyles()
  const { col = 3, children } = props
  return (
    <div className={classes.colume} style={{ gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))` }}>
      {children}
    </div>
  )
}

export default DescriptionColume
