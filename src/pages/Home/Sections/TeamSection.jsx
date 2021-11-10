import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons

// core components
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";
import Card from "../../../components/Card/Card";
import CardBody from "../../../components/Card/CardBody";

import styles from "./teamStyle";

import team1 from "./../images/2-1.png";
import team2 from "./../images/4-1.png";
import team3 from "./../images/3-1.png";

const useStyles = makeStyles(styles);

export default function TeamSection() {
  const classes = useStyles();
  const imageClasses = classNames(
    classes.imgRaised,
    classes.imgRoundedCircle,
    classes.imgFluid
  );
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Here is our team</h2>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team1} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                罗伟
                <br />
                <small className={classes.smallTitle}>设计师</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍 <a href="http://www.baidu.com" style={{
                    color: '#9c27b0',
                    textDecoration: 'none',
                    backgroundColor: 'transparent'
                  }}>links</a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team2} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                林玉良
                <br />
                <small className={classes.smallTitle}>设计师</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍 <a href="http://www.baidu.com" style={{
                    color: '#9c27b0',
                    textDecoration: 'none',
                    backgroundColor: 'transparent'
                  }}>links</a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card plain>
              <GridItem xs={12} sm={12} md={6} className={classes.itemGrid}>
                <img src={team3} alt="..." className={imageClasses} />
              </GridItem>
              <h4 className={classes.cardTitle}>
                包小糯
                <br />
                <small className={classes.smallTitle}>设计师</small>
              </h4>
              <CardBody>
                <p className={classes.description}>
                  个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍个人介绍 <a href="http://www.baidu.com" style={{
                    color: '#9c27b0',
                    textDecoration: 'none',
                    backgroundColor: 'transparent'
                  }}>links</a>
                </p>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
