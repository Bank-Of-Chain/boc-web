import { gql } from "@apollo/client";
import { get, isEmpty } from "lodash";
import { bscClient, ethClient, maticClient } from "../apollo/client";

// === Services === //
import { arrayAppendOfDay, usedPreValue } from "./../helpers/array-append";

/**
 * TVL
 * Total Profit
 * Yesterday Profit
 */
const VAULT_DATA_QUERY = `
query($last2WeeksTimestamp: BigInt) {
    vaults(first: 1) {
        id
        tvl
        totalProfit
        decimals
        holderCount
    }
    vaultDailyDatas(where: {
        id_gt: $last2WeeksTimestamp
    }) {
        totalProfit
    }
}
`;
const getVaultData = async client => {
  if (isEmpty(client)) return;
  const { data } = await client.query({
    query: gql(VAULT_DATA_QUERY),
    variables: {
      last2WeeksTimestamp: getDaysAgoTimestamp(14),
    },
  });
  const firstItem = get(data, "vaults.[0]", {});
  const { id, tvl, holderCount, totalProfit, decimals } = firstItem;
  return {
    address: id,
    tvl: tvl,
    holderCount: holderCount,
    totalProfit: totalProfit,
    decimals: decimals,
    weeksData: get(data, "vaultDailyDatas", []),
    // yesterdayProfit: get(data, 'vaultDailyData.totalProfit', '0')
  };
};

export const getETHVaultData = async () => {
  return await getVaultData(ethClient);
};

export const getBSCVaultData = async () => {
  return await getVaultData(bscClient);
};

export const getMaticVaultData = async () => {
  return await getVaultData(maticClient);
};

function getDaysAgoTimestamp(daysAgo) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const daysAgoTimestamp = currentTimestamp - daysAgo * 86400;
  return daysAgoTimestamp - (daysAgoTimestamp % 86400);
}

export function getDaysAgoUtcTimestamp(daysAgo) {
  const daysAgoTimestamp = getDaysAgoTimestamp(daysAgo);
  return daysAgoTimestamp + new Date().getTimezoneOffset() * 60;
}
