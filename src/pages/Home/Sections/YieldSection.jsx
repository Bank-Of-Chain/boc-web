import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import CheckIcon from "@material-ui/icons/Check"
import styles from "./yieldStyle"

const useStyles = makeStyles(styles)

export default function YieldSection() {
  const classes = useStyles()
  const yieldSources = [
    'Market-making fees.',
    'Interest from over-collateralized lending.',
    'Governance token rewards.'
  ]
  return (
    <div className={classes.yieldSection}>
      <h2 className={classes.title}>
        Sources of
        <svg width={280} height={155} className={classes.svg}>
          <defs>
            <linearGradient id="colorfulSvg" gradientUnits="userSpaceOnUse" x1="0" y1="100%" x2="103%" y2="0">
              <stop offset="0" style={{ stopColor: "#F4ACF3" }}/>
              <stop offset="1" style={{ stopColor: "#A68EFD" }}/>
            </linearGradient>
          </defs>
        <text textAnchor="middle" className={classes.colorful} x="150" y="104">yield.</text>
        </svg>
      </h2>
      <h3 className={classes.subTitle}>
        The best long-term <strong>risk-free</strong> return
      </h3>
      <p className={classes.description}>
        Bank of Chain maximizes returns in a scalable and safe manner, only interacting with carefully-vetted protocols.
      </p>
      <p className={classes.description}>
        Yields are obtained from three sources:
      </p>
      <ul className={classes.sourceList}>
        {yieldSources.map(item => (
          <li key={item} className={classes.sourceItem}>
            <CheckIcon className={classes.checkIcon} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}