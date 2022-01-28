import React, { useState } from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../Grid/GridContainer"
import GridItem from "../Grid/GridItem"

// === Utils === //
import map from "lodash/map"
import groupBy from "lodash/groupBy"
import values from "lodash/values"

// === Constants === //
import AMMS from "./../../constants/amms"
import CHAINS from "./../../constants/chains"

import styles from "./styles"
import STABLECOINS from "../../constants/stableCoins";

const useStyles = makeStyles(styles)
export default function Amms () {
  const classes = useStyles()

  const [showMore, setShowMore] = useState(false)

  function imgError (e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = "/default.webp"
  }
  // 需要将一维数组转化成二维数组进行展示，每个数组4或5个平台
  const amms = values(
    groupBy(
      map(AMMS, (item, i) => {
        return {
          name: item,
          index: i,
        }
      }),
      item => {
        return `${Math.floor(item.index / 9)}-${item.index % 9 >= 4}`
      },
    ),
  )
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12} style={{ paddingBottom: 20 }}>
        {map(CHAINS, c => (
          <div key={c.id} className={classes.item}>
            <img className={classes.img} src={`/images/chains/${c.id}.png`} alt={c.name} />
            <span className={classes.text}>{c.name}</span>
          </div>
        ))}
      </GridItem>

    <GridItem xs={12} sm={12} md={12} style={{ paddingBottom: 20 }}>
        {map(STABLECOINS, c => (
            <div key={c.id} className={`${classes.item} ${classes.onlyImg}`}>
                <img className={classes.img} src={`/images/stablecoins/${c.id}.png`} alt={c.symbol} />
            </div>
        ))}
        <div key={'chainlink'} className={classes.item}>
            <img className={classes.img} src={`/images/oracles/chainlink.png`} alt={'Chainlink'} />
            <span className={classes.text}>{'Chainlink'}</span>
        </div>
    </GridItem>

      <GridItem>
        {map(amms, (colume, index) => {
          if (!showMore && index > 2) return
          return (
            <div key={index}>
              {map(colume, a => (
                <div key={a.name} className={classes.item}>
                  <img className={classes.img} src={`/images/amms/${a.name}.png`} alt={a.name} onError={imgError} />
                  <span className={classes.text}>{a.name}</span>
                </div>
              ))}
            </div>
          )
        })}
        {!showMore && (
          <p className={classes.more} onClick={() => setShowMore(true)}>
            ...and more
          </p>
        )}
      </GridItem>
    </GridContainer>
  )
}
