import VAULT_ABI_V2_0 from '@/abis/v2.0/vault-abi.json'
import STRATEGY_ABI_V2_0 from '@/abis/v2.0/strategy-abi.json'
import IERC20_ABI from '@/abis/v2.0/ierc20-abi.json'
import VALUE_INTERPRETER_ABI_V2_0 from '@/abis/v2.0/value-interpreter-abi.json'

// === legacy === //
import EXCHANGE_ADAPTER_ABI_V1_5_9 from '@/abis/beta-v1.5.9/exchange-adapter-abi.json'
import EXCHANGE_AGGREGATOR_ABI_v1_6_0 from '@/abis/ethi-v1.6.0/exchange-aggregator-abi.json'

export const BETA_V1_5_9 = 'beta-v1.5.9'
export const BETA_V1_5_10 = 'beta-v1.5.10'
export const ETHI = 'ethi'
export const ETHI_v1_5_10 = 'ethi-v1.5.10'
export const USDI_V1_6_0 = 'usdi-v1.6.0'
export const ETHI_V1_6_0 = 'ethi-v1.6.0'

export const COMMON = 'common'

// abi rely on
export const ABI_SEQUENCE = {
  [BETA_V1_5_10]: [COMMON, BETA_V1_5_9, BETA_V1_5_10],
  [BETA_V1_5_9]: [COMMON, BETA_V1_5_9],
  [ETHI]: [COMMON, ETHI],
  [ETHI_v1_5_10]: [COMMON, ETHI, ETHI_v1_5_10],
  [USDI_V1_6_0]: [COMMON, BETA_V1_5_9, USDI_V1_6_0],
  [ETHI_V1_6_0]: [COMMON, ETHI, ETHI_V1_6_0]
}

export { VAULT_ABI_V2_0, STRATEGY_ABI_V2_0, IERC20_ABI, VALUE_INTERPRETER_ABI_V2_0, EXCHANGE_ADAPTER_ABI_V1_5_9, EXCHANGE_AGGREGATOR_ABI_v1_6_0 }
