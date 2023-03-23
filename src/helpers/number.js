// === Utils === //
import { BigNumber } from 'ethers'
import BN from 'bignumber.js'
import isNaN from 'lodash/isNaN'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'

/**
 *
 * @param {*} str
 * @param {*} decimals
 * @param {*} lower
 * @returns
 */
export const isValid = (str = '', decimals = 1, lower) => {
  const decimalsValue = BigNumber.from(10).pow(decimals)

  if (isEmpty(str) || isEqual(str, '-') || isEqual(str, '0') || isEmpty(str.replace(/ /g, ''))) return
  // not a number
  if (isNaN(Number(str))) return false
  const nextValue = BN(str)
  const nextFromValue = nextValue.multipliedBy(decimalsValue.toString())

  if (nextFromValue.lt(0)) return false
  // value should be integer
  if (!nextFromValue.isInteger()) return false
  // balance less than value
  if (!isEmpty(lower) && nextFromValue.gt(lower.toString())) return false

  return true
}
