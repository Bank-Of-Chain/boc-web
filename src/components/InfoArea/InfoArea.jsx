import React from 'react'
// nodejs library to set properties for components
import PropTypes from 'prop-types'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'

import styles from './infoStyle'

const useStyles = makeStyles(styles)

export default function InfoArea(props) {
  const classes = useStyles()
  const { title, description, icon } = props

  return (
    <div className={classes.infoArea}>
      <div className={classes.iconWrapper}>{icon}</div>
      <div className={classes.descriptionWrapper}>
        <div className={classes.title}>{title}</div>
        <p className={classes.description}>{description}</p>
      </div>
    </div>
  )
}

InfoArea.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.array.isRequired, PropTypes.string.isRequired])
}
