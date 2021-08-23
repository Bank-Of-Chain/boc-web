import BN from 'bignumber.js';
import isEmpty from 'lodash/isEmpty';

export const toFixed = (value, precision = 1, ...args) => {
  if (isEmpty(value)) {
    return 0;
  }
  const results = BN(value.toString()).div(BN(precision.toString()));
  if (isEmpty(args)) {
    return results.toString()
  }
  return results.toFixed(...args);
}