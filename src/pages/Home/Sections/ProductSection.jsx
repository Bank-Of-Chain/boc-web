import React, { useState, useEffect } from "react"
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
    title: "Funds Allocation",
    descriptions: [
      "The investment for a single agreement shall not exceed 30% of the total.",
      "The investment for a single capital pool shall not exceed 20% of the total.",
      "The investment for a single capital pool shall not exceed 50% of the existing capital in the capital pool.",
    ],
    imagePath: require("./../images/point-4.png"),
  },
  {
    title: "Easy to Use",
    descriptions: [
      "There are only two operations to be made, deposit and withdraw, and there is no need to perform and pay for complex operations such as harvest, exchange, and reallocation.",
      "The income is automatically reinvested, and the funds can be deposited and withdrawn at any time.",
      "Historical and dynamic returns are visible.",
    ],
    imagePath: require("./../images/point-3.png"),
  },
  {
    title: "Safe",
    descriptions: [
      "A third party audit.",
      "The scale of issued eligible stable-coins/USDT? exceeds 1 billion US dollars, and the quotation is based on Chain Link.",
      "The scale of locked eligible stable-coins/USDT? exceeds 5 billion US dollars, and the connected DEX and lending protocols are its first-line protocols.",
      "No third-party cross-chain bridge is used.",
    ],
    imagePath: require("./../images/point-1.png"),
  },
  {
    title: "Risk control",
    descriptions: [
      "Stable-coin de-anchoring risk: not using algorithmic stable-coins, partially mortgaged stable-coins, and stable-coins generated from long-tail asset mortgages.",
      "Risk of unpaid loss: market-making is limited to stable-coin asset trading pairs.",
      "Knock-on systemic risk: excluding nested tokens and the Lego Protocol.",
      "Long-tail risk: not getting returns by providing risky services, such as insurance, share options.",
      "Leverage risk: not using leverage to amplify risk and reward.",
    ],
    imagePath: require("./../images/point-5.png"),
  },
  {
    title: "Smart",
    descriptions: [
      "Regularly evaluate the changes of income in each capital pool, and weigh the cost and income of reallocation.",
      "Search for the best path for exchange through aggregators.",
      "Carry out foreign exchange income arbitrage, and automatically increase or decrease leverage according to the exchange rate and income fluctuations.",
      "Set complex parameters for market-making and lending strategy.",
    ],
    imagePath: require("./../images/point-6.png"),
  },
]

export default function ProductSection () {
  const classes = useStyles()
  const [hoverItem, setHoverItem] = useState(0)

  useEffect(() => {
    const roll = () => {
      setHoverItem((hoverItem + 1) % 5)
    }

    const timer = setInterval(roll, 3000)
    return () => clearInterval(timer)
  }, [hoverItem])

  return (
    <div className={classes.section} onMouseLeave={() => setHoverItem(0)}>
      <GridContainer style={{ margin: "0 auto" }}>
        {map(data, (item, i) => {
          const { title, descriptions = [], imagePath } = item
          const isChecked = hoverItem === i
          return (
            <GridItem
              className={classNames(classes.item, isChecked && classes.checked)}
              key={`${i}`}
              xs={12}
              sm={12}
              md={isChecked ? 4 : 2}
              onMouseEnter={() => setHoverItem(i)}
            >
              <InfoArea
                title={title}
                description={
                  isChecked
                    ? map(descriptions, (d, index) => (
                        <span key={`item-${index}`} className={classes.description}>
                          {index + 1}. {d}
                        </span>
                      ))
                    : []
                }
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
