import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
import Chat from "@material-ui/icons/Chat";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import Fingerprint from "@material-ui/icons/Fingerprint";
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
            BOC 项目，全称Bank Of Chain。是通过进行稳定币投资，获取稳定收益的平台。底层对接Yearn、Uniswap、Dodo、Curve等众多知名的第三方平台。
            定期的矿币提取和调仓，确保平台收益最大化。社区+多签的工作模式，让大家来决定资金的投资方向。
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="社区多签机制"
              description="良好的社区建设+多签机制，让项目的每一次投资都变成一次集思广益。"
              icon={Chat}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="合约审查"
              description="专业的合约审查团队，给予你等同于一流 Defi 项目的保障，让漏洞无所遁形。"
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="资金安全"
              description="稳定币保本投资，稳定收益，保障用户资金安全。"
              icon={Fingerprint}
              iconColor="danger"
              vertical
            />
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
