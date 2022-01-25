import {
    gql
} from '@apollo/client';
import {
    get,
    isEmpty
} from 'lodash';
import {
    bscClient,
    ethClient,
    maticClient
} from "../apollo/client";

// === Services === //
import {
    arrayAppendOfDay
} from './../helpers/array-append'

/**
 * TVL
 * Total Profit
 * Yesterday Profit
 */
const VAULT_DATA_QUERY = `
query($yesterdayTimestamp: BigInt) {
    vaults(first: 1) {
        id
        tvl
        totalProfit
        decimals
        holderCount
    }
    vaultDailyData(id: $yesterdayTimestamp) {
        totalProfit
    }
}
`;
const getVaultData = async (client) => {
    if (isEmpty(client)) return
    const {
        data
    } = await client.query({
        query: gql(VAULT_DATA_QUERY),
        variables: {
            yesterdayTimestamp: getDaysAgoTimestamp(1)
        },
    });
    return {
        address: data.vaults[0].id,
        tvl: data.vaults[0].tvl,
        holderCount: data.vaults[0].holderCount,
        totalProfit: data.vaults[0].totalProfit,
        decimals: data.vaults[0].decimals,
        yesterdayProfit: data.vaultDailyData.totalProfit
    };
};

export const getETHVaultData = async () => {
    return await getVaultData(ethClient);
}

export const getBSCVaultData = async () => {
    return await getVaultData(bscClient);
}

export const getMaticVaultData = async () => {
    return await getVaultData(maticClient);
}

const VAULT_DAILY_QUERY = `
query($beginDayTimestamp: BigInt) {
     vaultDailyDatas (
      orderBy: id,
      orderDirection: asc,
      where: {
      id_gt: $beginDayTimestamp
     }) {
      id
      tvl
      totalShares
      usdtPrice,
      pricePerShare
     }
    }
`;
export const getETHLast30DaysVaultData = async () => {
    return await ethClient
        .query({
            query: gql(VAULT_DAILY_QUERY),
            variables: {
                beginDayTimestamp: getDaysAgoTimestamp(30),
            },
        })
        .then((resp) => get(resp, 'data.vaultDailyDatas')).then(a => arrayAppendOfDay(a, 30));
}

function getDaysAgoTimestamp(daysAgo) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const daysAgoTimestamp = currentTimestamp - daysAgo * 86400;
    return daysAgoTimestamp - (daysAgoTimestamp % 86400);
}