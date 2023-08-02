import BN from 'bignumber.js'
import isEmpty from 'lodash/isEmpty'
import padEnd from 'lodash/padEnd'
import { isNil, isNull } from 'lodash'
import numeral from 'numeral'

export const toFixed = (value, precision = 1, ...args) => {
  if (isNil(value)) return undefined
  if (isNull(precision)) return value.toString()
  const precisionBN = BN(precision.toString())
  if (isEmpty(value) || precisionBN.isZero()) {
    return '0'
  }
  const results = BN(value.toString()).div(precisionBN)
  if (results.isInteger()) {
    return results.toFixed()
  }
  return results.toFixed(...args)
}

const DISPLAY_DECIMALS = 6
const MATH_FLOOR_SIGN = 1
export const formatBalance = (balance, decimals, options = {}) => {
  const { displayDecimals = DISPLAY_DECIMALS, showAll = false } = options
  const value = BN(balance.toString())
  const decimalsValue = BN(10).pow(decimals)
  if (showAll) {
    let fixedValue = toFixed(value, decimalsValue, undefined, MATH_FLOOR_SIGN)
    const dotIndex = fixedValue.indexOf('.')
    if (dotIndex !== -1) {
      fixedValue = padEnd(fixedValue, DISPLAY_DECIMALS + dotIndex + 1, '0')
    }
    return fixedValue
  }
  // If number lt 0.000000, add ...
  const isLessThenDisplay = decimals > 6 && !value.eq(0) && value.lt(BN(10).pow(decimals - displayDecimals + 1))
  const displayBalance = toFixed(value, decimalsValue, displayDecimals, MATH_FLOOR_SIGN)
  return isLessThenDisplay ? `${displayBalance}...` : displayBalance
}

/**
 * Handle numeral bug
 * numeral('999.999').format('0,0.[00] a') return '1 '
 * numeral('999999.999').format('0,0.[00] a') return '1 k'
 * @param {*} value
 * @param {*} formatter
 * @returns
 */
export const numeralFormat = (value, formatter) => {
  let result = numeral(value).format(formatter)
  if (value > 999 && result === '1 ') {
    return '1 k'
  }
  if (value > 999999 && result === '1 k') {
    return '1 m'
  }
  if (value > 999999999 && result === '1 m') {
    return '1 b'
  }
  if (value > 999999999999 && result === '1 b') {
    return '1 t'
  }
  return result
}
