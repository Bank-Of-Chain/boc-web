import axios from 'axios'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import moment from 'moment'
import { ENV_NETWORK_TYPE } from '../constants'

// === Constants === //
import {
  BOC_SERVER,
  NET_WORKS,
} from './../constants'

const ETH = NET_WORKS[0]

// axios.interceptors.response.use(function (response) {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response.data;
// }, function (error) {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   return Promise.reject(error);
// })


export const getDefiRate = async () => {
  const rs = await axios.get(`${BOC_SERVER}/v1/defi/rate`).then(resp => resp.data)
  if (isEmpty(rs)) throw new Error("查询失败")
  return rs
}

export const getAPY = async ({
  date = moment().utcOffset(0).subtract(1, 'days').format('YYYY-MM-DD'), // 展示昨天数据
  duration = 'monthly',
  chainId = ENV_NETWORK_TYPE,
  tokenType = 'USDi'
} = {}) => {
  const validChainId = !map(NET_WORKS, 'chainId').includes(parseInt(chainId)) ? ETH.chainId : chainId
  const rs = await axios.get(`${BOC_SERVER}/apy/vault_apy`, {
    params: {
      chainId: validChainId,
      duration,
      offset: 0,
      limit: 1,
      tokenType
    }
  }).then(resp => {
    return resp.data.content[0]?.apy
  })
  return rs
}
