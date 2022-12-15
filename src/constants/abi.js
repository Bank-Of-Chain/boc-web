export const BETA_V1_5_9 = 'beta-v1.5.9'
export const BETA_V1_5_10 = 'beta-v1.5.10'
export const ETHI = 'ethi'
export const ETHI_v1_5_10 = 'ethi-v1.5.10'
export const USDI_V1_6_0 = 'usdi-v1.6.0'
export const ETHI_V1_6_0 = 'ethi-v1.6.0'

export const USDI_v1_6_9 = 'usdi-v1.6.9'
export const ETHI_v1_6_9 = 'ethi-v1.6.9'

export const COMMON = 'common'

// abi rely on
export const ABI_SEQUENCE = {
  [BETA_V1_5_10]: [COMMON, BETA_V1_5_9, BETA_V1_5_10],
  [BETA_V1_5_9]: [COMMON, BETA_V1_5_9],
  [ETHI]: [COMMON, ETHI],
  [ETHI_v1_5_10]: [COMMON, ETHI, ETHI_v1_5_10],
  [USDI_V1_6_0]: [COMMON, BETA_V1_5_9, USDI_V1_6_0],
  [ETHI_V1_6_0]: [COMMON, ETHI, ETHI_V1_6_0],
  [USDI_v1_6_9]: [COMMON, BETA_V1_5_9, USDI_V1_6_0, USDI_v1_6_9],
  [ETHI_v1_6_9]: [COMMON, ETHI, ETHI_V1_6_0, ETHI_v1_6_9]
}
