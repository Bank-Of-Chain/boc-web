import React from "react"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import InfoArea from "../../../components/InfoArea/InfoArea"

// === Styles === //
import styles from "./productStyle"

const useStyles = makeStyles(styles)

export default function ProductSection () {
  const classes = useStyles()
  return (
    <div className={classes.section}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <InfoArea
            title='安全透明'
            description={[
              <span key='item-1' className={classes.description}>
                1. 投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币
              </span>,
              <span key='item-2' className={classes.description}>
                2. 投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估
              </span>,
              <span key='item-3' className={classes.description}>
                3. 严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全
              </span>,
            ]}
            icon={<img src={require("./../images/point-1.png")} alt='' />}
            iconColor='danger'
            vertical
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <InfoArea
            title='收益最大化'
            description={[
              <span key='item-4' className={classes.description}>
                1. 不断地搜寻、评估、接入安全可靠的高收益协议，进行投资
              </span>,
              <span key='item-5' className={classes.description}>
                {" "}
                2. 严格的代码评审，减少投资过程中的GAS消耗，兑换消耗，投资路径消耗，最大化耕作收益
              </span>,
              <span key='item-6' className={classes.description}>
                3. 优化算法，自动化地进行资金调配，评估了收益、损失，风险，最大化资金投资收益
              </span>,
            ]}
            icon={<img src={require("./../images/point-2.png")} alt='' />}
            iconColor='info'
            vertical
          />
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <InfoArea
            title='省心易用'
            description={[
              <span key='item-7' className={classes.description}>
                1. 平台仅收取用户收益的提成，无各类隐藏费用，用户可以在任意时间存入或者取回
              </span>,
              <span key='item-8' className={classes.description}>
                2. 平台自动在最佳时机耕作，让用户可以明确看到其数字资产在持续获得复利
              </span>,
            ]}
            icon={<img src={require("./../images/point-3.png")} alt='' />}
            iconColor='success'
            vertical
          />
        </GridItem>
      </GridContainer>
    </div>
  )
}
