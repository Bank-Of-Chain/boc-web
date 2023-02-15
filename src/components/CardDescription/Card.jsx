import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Description from './Description'
import DescriptionColume from './DescriptionColume'

// === Utils === //
import map from 'lodash/map'

// === Styles === //
import styles from './card-style'

const useStyles = makeStyles(styles)

const Card = props => {
  const classes = useStyles()
  const { icon, title, contents, footers } = props
  return (
    <a className={classes.item}>
      <div className={classes.inner}>
        <div className={classes.header}>
          <div className={classes.icon}>{icon}</div>
          <div className={classes.text}>{title}</div>
        </div>
        <div className={classes.body}>
          <DescriptionColume>
            {map(contents, (i, index) => {
              const { title, content } = i
              return <Description key={index} title={title} content={content}></Description>
            })}
          </DescriptionColume>
        </div>
        <div className={classes.footer}>
          <DescriptionColume>
            {map(footers, (i, index) => {
              const { title, content } = i
              return <Description key={index} title={title} content={content}></Description>
            })}
          </DescriptionColume>
        </div>
      </div>
    </a>
  )
}

export default Card
