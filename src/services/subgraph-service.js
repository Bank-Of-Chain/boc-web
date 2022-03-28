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
    arrayAppendOfDay, usedPreValue
} from './../helpers/array-append'

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
const getVaultData = async (client) => {
    if (isEmpty(client)) return
    const {
        data
    } = await client.query({
        query: gql(VAULT_DATA_QUERY),
        variables: {
            last2WeeksTimestamp: getDaysAgoTimestamp(14)
        },
    });
    const firstItem = get(data, 'vaults.[0]', {})
    const {
        id,
        tvl,
        holderCount,
        totalProfit,
        decimals
    } = firstItem
    return {
        address: id,
        tvl: tvl,
        holderCount: holderCount,
        totalProfit: totalProfit,
        decimals: decimals,
        weeksData: get(data, 'vaultDailyDatas', [])
        // yesterdayProfit: get(data, 'vaultDailyData.totalProfit', '0')
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
      totalShares,
      pricePerShare,
      unlockedPricePerShare
     }
    }
`;
// 2月8日 0点时间戳
const timeStart = 1644249600;
export const getETHLast30DaysVaultData = async () => {
    if(isEmpty(ethClient)) return []

    let nextStartTimestamp = getDaysAgoUtcTimestamp(60)
    // eth链 不统计2月7日前的数据
    if(nextStartTimestamp < timeStart){
        nextStartTimestamp = timeStart
    }
    return await ethClient
        .query({
            query: gql(VAULT_DAILY_QUERY),
            variables: {
                beginDayTimestamp: nextStartTimestamp,
            },
        })
        .then((resp) => get(resp, 'data.vaultDailyDatas'))
        .then(a => arrayAppendOfDay(a, 60))
        .then((array) => usedPreValue(array, 'totalShares', undefined))
        .then((array) => usedPreValue(array, 'unlockedPricePerShare', undefined))
        .then((array) => array.slice(-31));
}

function getDaysAgoTimestamp(daysAgo) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const daysAgoTimestamp = currentTimestamp - daysAgo * 86400;
    return daysAgoTimestamp - (daysAgoTimestamp % 86400);
}

export function getDaysAgoUtcTimestamp(daysAgo) {
    const daysAgoTimestamp = getDaysAgoTimestamp(daysAgo)
    return daysAgoTimestamp + new Date().getTimezoneOffset() * 60 ;
}