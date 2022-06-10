import React from "react"
import classNames from "classnames"

import { makeStyles } from "@material-ui/core/styles"
import Timeline from "@material-ui/lab/Timeline"
import TimelineItem from "@material-ui/lab/TimelineItem"
import TimelineSeparator from "@material-ui/lab/TimelineSeparator"
import TimelineContent from "@material-ui/lab/TimelineContent"
import TimelineDot from "@material-ui/lab/TimelineDot"
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent"
import TimelineCard from "../TimelineCard"

import styles from "./style"

const useStyles = makeStyles(styles)

export default function CustomTimeline(props) {
  const {
    events = [],
    topText = 'Now',
    cardColorReverse = false,
    connectorColorRevese = false
  } = props
  const classes = useStyles()

  return (
    <div className={classes.timelineWrapper}>
      <div className={classes.topInfo}>{topText}</div>
      <div className={classes.events}>
        <div
          className={classNames(classes.connector, {
            [classes.connectorColorRevese]: connectorColorRevese
          })}
        />
        <Timeline className={classes.timeline} align="alternate">
          {events.map((item, index) => {
            const isOdd = index % 2 === 0
            const cardProps = {
              colorReverse: cardColorReverse
            }
            if (!isOdd) {
              cardProps.arrowDirection = "right"
            }
            return (
              <TimelineItem key={item.event} className={classes.timelineItem}>
                <TimelineOppositeContent>
                  <p className={classes.keyTime}>{item.date}</p>
                </TimelineOppositeContent>
                <TimelineSeparator className={classes.separator}>
                  <TimelineDot className={classes.dot} />
                </TimelineSeparator>
                <TimelineContent>
                  <TimelineCard {...cardProps}>{item.event}</TimelineCard>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </div>
    </div>
  )
}
