import axios from 'axios'

// === Utils === //
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'

// === Constants === //
import { BOC_SERVER, NET_WORKS, ENV_NETWORK_TYPE } from '@/constants'

const ETH = NET_WORKS[0]

export const getDefiRate = async (chain = '1', type) => {
  if (isEmpty(chain) || isEmpty(type)) return Promise.reject('chainId & type must not be null')
  const params = {
    chain,
    type
  }
  const rs = await axios.get(`${BOC_SERVER}/v1/defi/rate`, { params }).then(resp => resp.data)
  if (isEmpty(rs)) throw new Error('fetch error')
  return rs
}

export const getAPY = async ({ duration = 'monthly', chainId = ENV_NETWORK_TYPE, tokenType = 'USDi' } = {}) => {
  const validChainId = !map(NET_WORKS, 'chainId').includes(parseInt(chainId)) ? ETH.chainId : chainId
  const rs = await axios
    .get(`${BOC_SERVER}/apy/vault_apy`, {
      params: {
        chainId: validChainId,
        duration,
        offset: 0,
        limit: 1,
        tokenType
      }
    })
    .then(resp => {
      return resp.data.content[0]?.apy
    })
  return rs
}

/**
 * get account profit, include unrealized and realized
 * @param {*} account
 * @param {*} params
 * @returns
 */
export const getProfits = (account, params) => {
  return axios
    .get(`${BOC_SERVER}/profit/account/${account}`, {
      params
    })
    .then(resp => resp.data)
}

/**
 * get account tvl, default recent 1 year
 * @param {*} account
 * @param {*} params
 * @returns
 */
export const getPersonTvlArray = (account, params) => {
  return axios
    .get(`${BOC_SERVER}/token/balance/account/${account}`, {
      params: {
        limit: 365,
        ...params
      }
    })
    .then(resp => resp.data)
}

/**
 * get account monthly profit
 * @param {*} account
 * @param {*} params
 * @returns
 */
export const getMonthProfits = (account, params) => {
  return axios
    .get(`${BOC_SERVER}/month_profit/account/${account}`, {
      params
    })
    .then(resp => resp.data)
}

/**
 * get account apy
 * @param {*} account
 * @param {*} date
 * @param {*} params
 * @returns
 */
export const getAccountApyByAddress = (account, date, params) => {
  return axios
    .get(`${BOC_SERVER}/apy/account_apy/accountAddress/${account}/date/${date}`, {
      params
    })
    .then(resp => resp.data)
}

/**
 * get latest profits
 * @param {*} address user address
 * @param {*} chainId
 * @param {*} tokenType USDI or ETHI
 * @returns
 */
export const getLatestProfit = (address, chainId, tokenType) => {
  if (isEmpty(address) || isEmpty(chainId) || isEmpty(tokenType)) return Promise.reject('address & chainId & tokenType must not be null')

  return axios
    .get(`${BOC_SERVER}/account_profit_history/last_time_profit/account/${address}`, {
      params: {
        chainId,
        tokenType
      }
    })
    .then(resp => resp.data)
}

/**
 * get segment profits in DAY/WEEK/MONTH
 * @param {*} address user address
 * @param {*} chainId
 * @param {*} tokenType USDI or ETHI
 * @param {*} segmentType DAY OR WEEK OR MONTH
 * @returns
 */
export const getSegmentProfit = (address, chainId, tokenType, segmentType) => {
  if (isEmpty(address) || isEmpty(chainId) || isEmpty(tokenType) || isEmpty(segmentType))
    return Promise.reject('address & chainId & tokenType & segmentType must not be null')

  return axios
    .get(`${BOC_SERVER}/account_profit_history/segment_profit/account/${address}`, {
      params: {
        chainId,
        tokenType,
        segmentType
      }
    })
    .then(resp => resp.data)
}

/**
 * get homepage data
 * @returns
 */
export const getHomePageData = () => {
  return axios.get(`${BOC_SERVER}/home-page`).then(resp => resp.data)
}
