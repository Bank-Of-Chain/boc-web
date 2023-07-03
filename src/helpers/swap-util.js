// === Utils === //
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import isNumber from 'lodash-es/isNumber'
import isString from 'lodash-es/isString'
import reduce from 'lodash-es/reduce'

export const ONEINCH_V4 = 'oneInchV4'
export const PARASWAP = 'paraswap'

export const SUPPORTS = [PARASWAP, ONEINCH_V4]
export const getProtocolsFromBestRouter = (bestSwapInfo = {}) => {
  if (isEmpty(bestSwapInfo) || isNumber(bestSwapInfo) || isString(bestSwapInfo)) return []
  const { name, bestRoute } = bestSwapInfo
  if (SUPPORTS.includes(name)) {
    let func
    switch (name) {
      case ONEINCH_V4:
        func = getProtocolsFromBestRouterFor1inchV4
        break
      case PARASWAP:
        func = getProtocolsFromBestRouterForParaswap
        break
      default:
    }
    return func(bestRoute)
  }
  throw new Error('not support')
}

export const getProtocolsFromBestRouterFor1inchV4 = bestRoute => {
  const nextProtocols = []
  const resp = get(bestRoute, '0.0.0')
  if (isEmpty(resp)) return nextProtocols
  const { name } = resp
  nextProtocols.push(name)
  return nextProtocols
}

export const getProtocolsFromBestRouterForParaswap = bestRoute => {
  const nextProtocols = reduce(
    bestRoute,
    (result, element) => {
      const name = get(element, 'swaps[0].swapExchanges[0].exchange', '')
      result.push(name)
      return result
    },
    []
  )
  return nextProtocols
}
