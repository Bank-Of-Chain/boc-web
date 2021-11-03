// === constants === //
import {
  APY_SERVER
} from "./../constants";

// === Utils === //
import get from "lodash/get";
import request from "request";
import {
  BigNumber
} from 'ethers';

/**
 * 通过接口获取vault的apy
 * @param {*} days 
 * @returns 
 */
export default function getApyByDays(days) {
  return new Promise((resolve, reject) => {
    request.get(`${APY_SERVER}/v3/vault/apy/${days}`, (error, response, body) => {
      console.log('error=', body);
      const jsonBody = JSON.parse(body);
      const {
        code
      } = jsonBody
      if (code !== 200) {
        reject('获取失败');
        return
      }
      resolve(BigNumber.from(get(jsonBody, 'data.apy', 0)));
    });
  })
}