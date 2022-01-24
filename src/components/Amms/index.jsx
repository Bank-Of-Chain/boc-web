import React from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../Grid/GridContainer"
import GridItem from "../Grid/GridItem"

// === Utils === //
import map from "lodash/map"

// === Constants === //
import AMMS from "./../../constants/amms"
import CHAINS from "./../../constants/chains"

import styles from "./styles"

const useStyles = makeStyles(styles)
export default function Amms () {
  const classes = useStyles()

  function imgError (e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = "/default.webp"
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        {map(CHAINS, c => (
          <div key={c.id} className={classes.item}>
            <img className={classes.img} src={`/images/chains/${c.id}.png`} alt={c.name} />
            <span className={classes.text}>{c.name}</span>
          </div>
        ))}
      </GridItem>
      <GridItem>
        {map(AMMS, a => (
          <div key={a} className={classes.item}>
            <img className={classes.img} src={`/images/amms/${a}.png`} alt={a} onError={imgError} />
            <span className={classes.text}>{a}</span>
          </div>
        ))}
      </GridItem>
    </GridContainer>
  )
}
