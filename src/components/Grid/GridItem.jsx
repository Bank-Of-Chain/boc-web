import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Grid from '@material-ui/core/Grid'

const styles = {
  grid: {
    position: 'relative',
    width: '100%',
    minHeight: '1px',
    flexBasis: 'auto'
  }
}

const useStyles = makeStyles(styles)

export default function GridItem(props) {
  const classes = useStyles()
  const { children, className, ...rest } = props
  return (
    <Grid item {...rest} className={classes.grid + ' ' + className}>
      {children}
    </Grid>
  )
}

GridItem.defaultProps = {
  className: ''
}

GridItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
}
