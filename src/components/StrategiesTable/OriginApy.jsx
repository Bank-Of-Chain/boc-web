import React, { useEffect, useState } from 'react';
import { SyncOutlined } from "@ant-design/icons";

// === Utils === //
import { toFixed } from "./../../helpers/number-format";
import request from "request";
import get from 'lodash/get';

// === Constants === //
import { APY_SERVER } from './../../constants';

import * as ethers from "ethers";
const { BigNumber } = ethers

export default function OriginApy(props) {
  const { id, days } = props;
  const [apy, setApy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true)
    request(`${APY_SERVER}/v3/strategy/${id}/apy/${days}`, (error, response, body) => {
      try {
        const obj = JSON.parse(body);
        setApy(get(obj, 'data.apy', 0))
      } catch (error) {
        setApy(0);
      }
      setTimeout(() => {
        setIsLoading(false)
      }, 200);
    })
  }, [id, days])

  if (isLoading) return <SyncOutlined />
  return <span>{toFixed(BigNumber.from(apy), 1e2, 2)}%</span>
}