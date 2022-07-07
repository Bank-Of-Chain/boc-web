import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

// === Services === //
import {
  getETHVaultData,
  getBSCVaultData,
  getMaticVaultData,
} from "./../../../services/subgraph-service";
import { toFixed } from "../../../helpers/number-format";

// === Components === //
import GridContainer from "../../../components/Grid/GridContainer";
import GridItem from "../../../components/Grid/GridItem";

// === Utils === //
import sumBy from "lodash/sumBy";
import map from "lodash/map";
import compact from "lodash/compact";

import styles from "./tvlStyle";

const useStyles = makeStyles(styles);

export default function TvlSection() {
  const [obj, setObj] = useState({
    totalTvl: 0,
    earn: 0,
    totalEarn: 0,
    holders: 0,
  });
  useEffect(() => {
    Promise.all([getETHVaultData(), getBSCVaultData(), getMaticVaultData()])
      .then(compact)
      .then((array) => {
        const nextTotalTvl = sumBy(array, (i) =>
          parseFloat(toFixed(i.tvl, 10 ** i.decimals, 2))
        ).toFixed(2);
        const nextEarn = sumBy(array, (i) => {
          const total = sumBy(
            map(i.weeksData, (o) =>
              parseFloat(toFixed(o.totalProfit, 10 ** i.decimals, 2))
            )
          );
          return total;
        }).toFixed(2);
        const nextTotalEarn = sumBy(array, (i) =>
          parseFloat(toFixed(i.totalProfit, 10 ** i.decimals, 2))
        ).toFixed(2);
        const nextHoldCount = sumBy(array, (i) => parseInt(i.holderCount));
        return {
          totalTvl: nextTotalTvl,
          earn: nextEarn,
          totalEarn: nextTotalEarn,
          holders: nextHoldCount,
        };
      })
      .then(setObj)
      .catch((error) => {
        console.log("error", error);
      });
  }, []);

  const { totalTvl, earn, totalEarn, holders } = obj;
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <GridContainer>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.subTitle}>TVL</p>
              <p className={classes.title}>$ {totalTvl}</p>
            </GridItem>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.subTitle}>HOLDERS</p>
              <p className={classes.title}>{holders}</p>
            </GridItem>
          </GridContainer>
          <GridContainer>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.subTitle}>EARNINGS TOTAL</p>
              <p className={classes.title}>$ {totalEarn}</p>
            </GridItem>
            <GridItem xs={6} sm={6} md={6}>
              <p className={classes.subTitle}>EARNINGS (2 WEEKS)</p>
              <p className={classes.title}>$ {earn}</p>
            </GridItem>
          </GridContainer>
        </GridItem>
      </GridContainer>
    </div>
  );
}
