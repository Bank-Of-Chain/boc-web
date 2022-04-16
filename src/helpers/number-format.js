import BN from 'bignumber.js';
import isEmpty from 'lodash/isEmpty';
import padEnd from 'lodash/padEnd'

export const toFixed = (value, precision = 1, ...args) => {
  if (isEmpty(value)) {
    return 0;
  }
  const results = BN(value.toString()).div(BN(precision.toString()));
  if(results.isInteger()){
    return results.toFixed()
  }
  return results.toFixed(...args);
}

const DISPLAY_DECIMALS = 6
const MATH_FLOOR_SIGN = 1
export const formatBalance = (balance, decimals, options = {}) => {
  const {
    displayDecimals = DISPLAY_DECIMALS,
    showAll = false
  } = options
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
  // 显示的值为 0.000000 的话补 ... 
  const isLessThenDisplay = decimals > 6 && !value.eq(0) && value.lt(BN(10).pow(decimals - displayDecimals + 1))
  const displayBalance = toFixed(value, decimalsValue, displayDecimals, MATH_FLOOR_SIGN)
  return isLessThenDisplay ? `${displayBalance}...` : displayBalance
}
