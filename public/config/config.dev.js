/**
 * 开发环境配置文件
 */
const configBase = {
  vault_address: '',
  underlying_address: '',
  chain_browser_url: '',
  abi_version: 'v4.3',
  community_url: 'https://discord.gg/GjT2crrv',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://piggyfinance.github.io/docs/zh/docs/"
}

const rpcUrl = 'http://localhost:8545'

const config137 = {
  ...configBase,
  apy_server: 'http://localhost:3000',
  rpcUrl,
  vault_address: "0xA343B1FC2897b8C49A72A9A0B2675cB9c7664e8c",
  underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  exchange_extra_params: {
    oneInch: {
      network: 137,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER', 'POLYGON_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 137,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
}

const config56 = {
  ...configBase,
  apy_server: 'http://localhost:4000',
  rpcUrl,
  abi_version: 'v4.4',
  vault_address: "0x47CD4297b04621b2CE041eAe635416e1b65f147f",
  underlying_address: "0x55d398326f99059fF775485246999027B3197955",
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER', 'BSC_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
}

window.config = {
  // 本地链
  31337: config56,
  // polygon
  137: config137,
  // bsc
  56: config56
};