// === Utils === //
import isEqual from 'lodash/isEqual'

// === Constants === //
import { ZERO_ADDRESS } from '@/constants/tokens'

/**
 *
 * @param {*} address
 * @returns
 */
export const isZeroAddress = (address = '') => {
  return isEqual(address, ZERO_ADDRESS)
}
