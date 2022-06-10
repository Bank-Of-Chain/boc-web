import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Timeline from "../../../components/Timeline"

// === Styles === //
import styles from "./roadMapStyle"

const useStyles = makeStyles(styles)

export default function RoadMapSection () {
  const classes = useStyles()
  const stepOne = [{
    date: 'May 15, 2022',
    event: 'BOC 2 Version'
  }, {
    date: 'May 10, 2022',
    event: 'Security audit'
  }, {
    date: 'July 15, 2022',
    event: 'Leveraging services'
  }, {
    date: 'August 1, 2022',
    event: 'BOC 1.5 Version'
  }]
  const stepTwo = [{
    date: 'March 4, 2022',
    event: 'Friend & Family Testing'
  }, {
    date: 'March 4, 2022',
    event: 'Logo design'
  }, {
    date: 'March 10, 2022',
    event: 'Formulation of token issuance rules'
  }, {
    date: 'April 15, 2022',
    event: 'White paper'
  }, {
    date: 'April 15, 2022',
    event: 'AWS server leasing and deployment'
  }]
  return (
    <div className={classes.roadmap}>
      <h3 className={classes.title}>Roadmap.</h3>
      <Timeline
        events={stepTwo}
        topText="NOW"
      />
      <Timeline
        events={stepOne}
        topText="NEXT STEPS"
        firstPlace="left"
        cardColorReverse
        connectorColorRevese
      />
    </div>
  )
}
