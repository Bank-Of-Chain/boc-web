import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import Fingerprint from "@material-ui/icons/Fingerprint";
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
// core components
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";
import InfoArea from "../../../components/InfoArea/InfoArea";

import styles from "./productStyle";

const useStyles = makeStyles(styles);

export default function ProductSection() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={8}>
          <h5 className={classes.description}>
            区块链银行&nbsp;&nbsp;是帮助普通投资者获取链上“无风险”保本理财的一款去中心化金融协议。针对普通投资者，该协议进行以下优化，以降低使用风险，提升用户体验。
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="安全透明"
              description={[
                <span key='item-1' className={classes.descriptionItem}>1. 投资仅限于有由法币提供足额抵押或数字资产提供超额抵押生成的稳定币</span>,
                <span key='item-2' className={classes.descriptionItem}>2. 投资的理财协议，需要有长期的安全运营记录，并经过社区严格风险评估</span>,
                <span key='item-3' className={classes.descriptionItem}>3. 严格的安全审计，合约透明，社区维护，保障用户的资金所有权和安全</span>
              ]}
              icon={Fingerprint}
              iconColor="danger"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="收益最大化"
              description={[
                <span key='item-4' className={classes.descriptionItem}>1. 不断地搜寻、评估、接入安全可靠的高收益协议，进行投资</span>,
                <span key='item-5' className={classes.descriptionItem}> 2. 严格的代码评审，减少投资过程中的GAS消耗，兑换消耗，投资路径消耗，最大化耕作收益</span>,
                <span key='item-6' className={classes.descriptionItem}>3. 优化算法，自动化地进行资金调配，评估了收益、损失，风险，最大化资金投资收益</span>
              ]}
              icon={TrendingUpIcon}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="省心易用"
              description={[
                <span key='item-7' className={classes.descriptionItem}>1. 平台仅收取用户收益的提成，无各类隐藏费用，用户可以在任意时间存入或者取回</span>,
                <span key='item-8' className={classes.descriptionItem}>2. 平台自动在最佳时机耕作，让用户可以明确看到其数字资产在持续获得复利</span>,
              ]}
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
