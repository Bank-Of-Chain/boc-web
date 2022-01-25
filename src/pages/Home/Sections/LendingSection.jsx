import React, { useEffect, useState } from "react"
import classNames from "classnames"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"

// === Utils === //
import map from "lodash/map"
import maxBy from "lodash/maxBy"
import moment from "moment"
import { calVaultAPY } from "./../../../helpers/apy"
import { toFixed } from "./../../../helpers/number-format"
import { getDefiRate } from "./../../../services/api-service"
import { getETHLast30DaysVaultData } from "./../../../services/subgraph-service"

// === Styles === //
import styles from "./lendingStyle"

const useStyles = makeStyles(styles)

const array = ["BlockFi", "Nexo", "Celsius"]
export default function LendingSection () {
  const classes = useStyles()
  const [data, setData] = useState([])

  useEffect(() => {
    Promise.all([
      getETHLast30DaysVaultData().then(a => {
        return {
          title: "boc",
          imagePath: "/logo.png",
          percent: (100 * calVaultAPY(a)).toFixed(2),
        }
      }),
      getDefiRate(),
    ])
      .then(([obj, resp]) => {
        const { data, svg } = resp
        return [
          obj,
          ...map(array, i => {
            return {
              title: i,
              imagePath: svg[i],
              percent: parseFloat(data[i]),
            }
          }),
        ]
      })
      .then(setData)
  }, [])
  const maxPercentItem = maxBy(data, "percent")
  const displayMaxValue = 10 * Math.ceil(maxPercentItem?.percent / 10)

  return (
    <div className={classes.section}>
      <h2 className={classes.title}>
        Crypto Lending Interest Rates for <span className={classes.text}>{moment().format("MMMM YYYY")}</span>
      </h2>
      <div style={{ padding: "4.5rem 0" }}>
        <GridContainer style={{ margin: "0 auto" }}>
          {map(data, (item, i) => {
            const { title, imagePath, percent } = item
            const nextPercent = percent / displayMaxValue
            const percentText = `${toFixed(nextPercent.toString(), 1e-2, 2)}%`
            return (
              <GridItem className={classNames(classes.item)} key={`${i}`} xs={3} sm={3} md={3}>
                <GridContainer className={classes.body}>
                  <GridItem className={classes.header} style={i === 0 ? { borderLeft: 0 } : {}}>
                    <div className={classes.bar} style={{ height: percentText }}>
                      <p>{percent}%</p>
                    </div>
                  </GridItem>
                  <GridItem className={classes.footer}>
                    <img src={imagePath} alt={title} />
                  </GridItem>
                </GridContainer>
              </GridItem>
            )
          })}
        </GridContainer>
      </div>
    </div>
  )
}
