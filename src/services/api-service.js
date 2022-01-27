import axios from 'axios'
import isEmpty from 'lodash/isEmpty'

// === Constants === //
import {
  BOC_SERVER
} from './../constants'

axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response.data;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
})


export const getDefiRate = async () => {
  const rs = await axios.get(`${BOC_SERVER}/v1/defi/rate`)
  if(isEmpty(rs)) throw new Error("查询失败")
  return rs
}