import React from "react"
import classNames from "classnames"
import { makeStyles } from "@material-ui/core/styles"
import styles from "./style"

const useStyles = makeStyles(styles)

export default function TimelineCard({
  children,
  colorReverse = false,
  arrowDirection = 'left'
}) {
  const classes = useStyles()

  return (
    <div
      className={classNames(classes.timelineCard, {
        [classes.colorReverse]: colorReverse
      })}
    >
      <p className={classes.content}>{children}</p>
      <div className={classNames(classes.arrow, {
        [classes.arrowLeft]: arrowDirection === 'left',
        [classes.arrowRight]: arrowDirection === 'right'
      })} />
    </div>
  )
}
