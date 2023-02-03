import axios from 'axios'

// === Constants === //
import { ETHI_KEEPER_SERVER } from '@/constants'

/**
 *
 * @returns
 */
export const removeFromVaultSuccess = (creditAddress, type) => {
  return axios.post(`${ETHI_KEEPER_SERVER}/v3/credit_accounts/borrowers/${creditAddress}/actions/${type === 0 ? 'decrease_debt' : 'redeem_collateral'}`)
}
