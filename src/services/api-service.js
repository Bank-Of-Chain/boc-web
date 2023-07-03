import axios from 'axios'

// === Utils === //
import map from 'lodash-es/map'
import isEmpty from 'lodash-es/isEmpty'

// === Constants === //
import { BOC_SERVER, NET_WORKS, ENV_NETWORK_TYPE } from '@/constants'

const ETH = NET_WORKS[0]

/**
 *
 * @param {*} chain
 * @param {*} type
 * @returns
 */
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

/**
 *
 * @param {*} param0
 * @returns
 */
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
 * get homepage data
 * @returns
 */
export const getHomePageData = () => {
  return axios.get(`${BOC_SERVER}/home-page`).then(resp => resp?.data)
}
