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

export const getAPYByDate = async ({
  date = moment().utcOffset(0).format('YYYY-MM-DD'),
  duration = 'monthly',
  chainId = ENV_NETWORK_TYPE
} = {}) => {
  const validChainId = !map(NET_WORKS, 'chainId').includes(parseInt(chainId)) ? ETH.chainId : chainId
  const rs = await axios.get(`${BOC_SERVER}/apy/vault_apy/date/${date}`, {
    params: {
      chainId: validChainId,
      duration
    }
  }).then(resp => resp.data)
  return rs
}
