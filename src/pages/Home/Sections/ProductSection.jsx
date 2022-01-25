import React, { useState } from "react"
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
    title: "Fund allocation",
    subTitle: "Fund allocation title",
    descriptions: [
      "投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币",
      "投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估",
      "严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全",
    ],
    imagePath: require("./../images/point-4.png"),
  },
  {
    title: "Easy to use",
    subTitle: "Easy to use title",
    descriptions: [
      "投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币",
      "投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估",
      "严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全",
    ],
    imagePath: require("./../images/point-3.png"),
  },
  {
    title: "Security",
    subTitle: "Security title",
    descriptions: [
      "投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币",
      "投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估",
      "严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全",
    ],
    imagePath: require("./../images/point-1.png"),
  },
  {
    title: "Protect",
    subTitle: "Protect title",
    descriptions: [
      "投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币",
      "投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估",
      "严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全",
    ],
    imagePath: require("./../images/point-5.png"),
  },
  {
    title: "Intelligence",
    subTitle: "Intelligence title",
    descriptions: [
      "投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币",
      "投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估",
      "严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全",
    ],
    imagePath: require("./../images/point-6.png"),
  },
]

export default function ProductSection () {
  const classes = useStyles()
  const [hoverItem, setHoverItem] = useState(0)
  return (
    // onMouseLeave={() => setHoverItem(0)}
    <div className={classes.section}>
      <GridContainer style={{ margin: "0 auto" }}>
        {map(data, (item, i) => {
          const { title, subTitle, descriptions = [], imagePath } = item
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
                    : [<span key={`sub-title`}>{subTitle}</span>]
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
