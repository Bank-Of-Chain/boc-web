import axios from 'axios'

// === Constants === //
import { APY_SERVER } from '@/constants'

/**
 *
 * @returns
 */
export const removeFromVaultSuccess = (creditAddress, type) => {
  return axios.post(`${APY_SERVER}/v3/credit_accounts/borrowers/${creditAddress}/actions/${type === 0 ? 'decrease_debt' : 'redeem_collateral'}`)
}
