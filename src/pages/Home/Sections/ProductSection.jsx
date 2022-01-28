import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import classNames from "classnames"

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import InfoArea from "../../../components/InfoArea/InfoArea"

// === Utils === //
import map from "lodash/map"

// === Styles === //
import styles from "./productStyle"

const useStyles = makeStyles(styles)

const data = [
  {
    title: "Third-Party Risk Diversification",
    descriptions: [
      "Investment in a single protocol shall not exceed 30% of the total capital.",
      "Investment in a single capital pool shall not exceed 20% of the total capital.",
      "Investment in a single capital pool shall not exceed 50% of the existing capital in that pool.",
    ],
    imagePath: require("./../images/point-4.png"),
  },
  {
    title: "Easy to Use",
    descriptions: [
      "Only deposit and withdraw, no necessary to implement and bear the cost of complex operations such as harvest, exchange, and reallocation.",
      "Automatically reinvest. Flexible deposit and withdrawal.",
      "Yield generations are visible.",
    ],
    imagePath: require("./../images/point-3.png"),
  },
  {
    title: "Safe",
    descriptions: [
      "Market cap of qualified Stablecoins exceeds 1 billion dollars.",
      "The TVL of qualified Blockchains exceeds 5 billion dollars.",
      "Third-party auditing.",
      "Only official cross-chain bridge.",
      "Price Quotation relies on Oracle.",
    ],
    imagePath: require("./../images/point-1.png"),
  },
  {
    title: "Risk control",
    descriptions: [
      "De-anchoring risk: no algorithmic Stablecoin, No partially collateralized Stablecoin, No stablecoin collateralized by a long-tail asset.",
      "Risk of impermanent loss: market-making only for stablecoin pairs.",
      "Systemic risk: very selective wrapped tokens and yield aggregators.",
      "Long-tail risk: no yield generated from risk-taking, such as insurance underwriting, sell call options.",
      "Leverage risk: no leverage in this version.",
    ],
    imagePath: require("./../images/point-5.png"),
  },
  {
    title: "Smart",
    descriptions: [
      "Regularly calibrate the yield, and weigh the cost and reward of reallocation.",
      "Search for the best rate through exchange aggregators.",
      "Complex FX interest swap. Adjusting FX synthesis based on exchange rate and yield.",
      "Automatically set parameters for market-making and lending strategy.",
    ],
    imagePath: require("./../images/point-6.png"),
  },
]

export default function ProductSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <GridContainer style={{ margin: "0 auto" }} justify='center'>
        {map(data, (item, i) => {
          const { title, descriptions = [], imagePath } = item
          return (
            <GridItem
              className={classNames(classes.item, classes.checked)}
              key={`${i}`}
              xs={12}
              sm={12}
              md={4}
              style={{
                paddingLeft: i % 3 === 0 ? 0 : 10,
              }}
            >
              <InfoArea
                title={title}
                description={map(descriptions, (d, index) => (
                  <span key={`item-${index}`} className={classes.description}>
                    {index + 1}. {d}
                  </span>
                ))}
                icon={<img src={imagePath} alt='' />}
                vertical
              />
            </GridItem>
          )
        })}
      </GridContainer>
    </div>
  )
}
