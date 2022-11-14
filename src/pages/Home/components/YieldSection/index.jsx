import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import styles from './yieldStyle'

const useStyles = makeStyles(styles)

export default function YieldSection() {
  const classes = useStyles()
  const yieldSources = ['Market-making fees.', 'Interest from over-collateralized lending.', 'Governance token rewards.', 'Rewards from staking.']
  return (
    <div className={classes.yieldSection}>
      <h2 className={classes.title}>
        Sources of
        <span className={classes.colorful}> yield</span>
      </h2>
      <h3 className={classes.subTitle}>
        The best long-term <strong>&quot;risk-free&quot;</strong> return
      </h3>
      <p className={classes.description}>
        Bank of Chain maximizes returns in a scalable and safe manner by only interacting with rigorously-evaluated protocols.
      </p>
      <p className={classes.description}>Yields are obtained from four sources:</p>
      <ul className={classes.sourceList}>
        {yieldSources.map(item => (
          <li key={item} className={classes.sourceItem}>
            <CheckIcon className={classes.checkIcon} />
            <span className={classes.text}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
