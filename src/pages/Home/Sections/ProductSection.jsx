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
          <h2 className={classes.title}>Let{"'"}s Defi</h2>
          <h5 className={classes.description}>
            这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，这是一段项目的介绍文档，
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Free Chat"
              description="良好的社区氛围和多签机制良好的社区氛围和多签机制良好的社区氛围和多签机制良好的社区氛围和多签机制良好的社区氛围和多签机制良好的社区氛围和多签机制"
              icon={Chat}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Verified Contract"
              description="审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本审查的合约脚本"
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Security"
              description="安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全安全"
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
