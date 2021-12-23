/**
 * 测试环境配置文件
 */
const configBase = {
  vault_address: "",
  underlying_address: "",
  chain_browser_url: '',
  abi_version: 'v4.3',
  community_url: 'https://discord.gg/GjT2crrv',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://piggyfinance.github.io/docs/zh/docs/"
}

const rpcUrl = 'http://192.168.60.12:8545'

const config137 = {
  ...configBase,
  apy_server: 'http://192.168.60.12/api/137',
  rpcUrl,
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
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
  // 币安链一个区块2千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 1800 * 10 ** 4
}

const config56 = {
  ...configBase,
  apy_server: 'http://192.168.60.12/api/56',
  rpcUrl,
  abi_version: 'v4.4',
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
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
  // 币安链一个区块8千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 7200 * 10 ** 4
}

const config1 = {
  ...configBase,
  apy_server: 'http://192.168.60.12/api/1',
  rpcUrl,
  abi_version: 'v4.4',
  vault_address: "",
  underlying_address: "",
  exchange_extra_params: {
    oneInch: {
      network: 1,
      excludeProtocols: ['ONE_INCH_LIMIT_ORDER', 'ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 1,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
  // ETH链一个区块3千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 2700 * 10 ** 4
}

window.config = {
  // 本地链
  31337: config56,
  // polygon
  137: config137,
  // bsc
  56: config56,
  // eth
  1: config1
};