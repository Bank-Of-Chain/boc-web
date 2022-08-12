import axios from "axios";

// === Utils === //
import map from "lodash/map";
import isEmpty from "lodash/isEmpty";

// === Constants === //
import { BOC_SERVER, NET_WORKS, ENV_NETWORK_TYPE } from "@/constants";

const ETH = NET_WORKS[0];

export const getDefiRate = async () => {
  const rs = await axios
    .get(`${BOC_SERVER}/v1/defi/rate`)
    .then((resp) => resp.data);
  if (isEmpty(rs)) throw new Error("查询失败");
  return rs;
};

export const getAPY = async ({
  duration = "monthly",
  chainId = ENV_NETWORK_TYPE,
  tokenType = "USDi",
} = {}) => {
  const validChainId = !map(NET_WORKS, "chainId").includes(parseInt(chainId))
    ? ETH.chainId
    : chainId;
  const rs = await axios
    .get(`${BOC_SERVER}/apy/vault_apy`, {
      params: {
        chainId: validChainId,
        duration,
        offset: 0,
        limit: 1,
        tokenType,
      },
    })
    .then((resp) => {
      return resp.data.content[0]?.apy;
    });
  return rs;
};
