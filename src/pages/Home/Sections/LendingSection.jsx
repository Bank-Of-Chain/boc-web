import React, { useEffect, useState } from "react"
import classNames from "classnames"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"

// === Utils === //
import map from "lodash/map"
import maxBy from "lodash/maxBy"
import isNaN from "lodash/isNaN"
import filter from "lodash/filter"
import sortBy from "lodash/sortBy"
import { calVaultAPY } from "./../../../helpers/apy"
import { toFixed } from "./../../../helpers/number-format"
import { getDefiRate } from "./../../../services/api-service"
import { getETHLast30DaysVaultData } from "./../../../services/subgraph-service"

// === Styles === //
import styles from "./lendingStyle"

const useStyles = makeStyles(styles)

const bocTitle = "BOC"

const array = ["Compound", "Aave", "Coinbase", "BlockFi", "Nexo", "Celsius", "YearnFinance", "CryptoCom", "Bitfinex"]
export default function LendingSection () {
  const classes = useStyles()
  const [data, setData] = useState([])

  useEffect(() => {
    Promise.all([
      getETHLast30DaysVaultData().then(a => {
        return {
          title: bocTitle,
          imagePath: "/logo.png",
          percent: (100 * calVaultAPY(a)).toFixed(2),
        }
      }),
      getDefiRate().catch(() =>
        Promise.resolve({
          data: {},
          svg: {},
        }),
      ),
    ])
      .then(([obj, resp]) => {
        const { data, svg } = resp
        return [
          obj,
          ...map(array, i => {
            return {
              title: i === "YearnFinance" ? "Yearn" : i,
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
        Trailing <span className={classes.text}>30-day</span> Crypto Average Lending Interest Rates
      </h2>
      <div style={{ padding: "4.5rem 0" }}>
        <GridContainer style={{ margin: "0 auto" }} justify='center'>
          {map(
            filter(
              sortBy(data, o => {
                if (o.title === bocTitle) {
                  return -10000
                }
                return -1 * o.percent
              }),
              o => !isNaN(o.percent),
            ),
            (item, i) => {
              const { title, imagePath, percent } = item
              const nextPercent = percent / displayMaxValue
              const percentText = `${toFixed(nextPercent.toString(), 1e-2, 2)}%`
              return (
                <GridItem className={classNames(classes.item)} key={`${i}`} xs={3} sm={3} md={1}>
                  <GridContainer className={classes.body}>
                    <GridItem className={classes.header} style={i === 0 ? { borderLeft: 0 } : {}}>
                      <div
                        className={classNames(classes.bar, title === bocTitle && classes.checked)}
                        style={{ height: percentText }}
                      >
                        <p
                          style={
                            title === bocTitle ? { width: "98px", left: "-50px", textAlign: "right", top: "-65px" } : {}
                          }
                        >
                          {percent}% {title === bocTitle && <span>(From Feb. 8)</span>}
                        </p>
                      </div>
                    </GridItem>
                    <GridItem className={classes.footer}>
                      <img title={title} src={imagePath} alt={title} />
                      <p>{title}</p>
                    </GridItem>
                  </GridContainer>
                </GridItem>
              )
            },
          )}
        </GridContainer>
      </div>
    </div>
  )
}
