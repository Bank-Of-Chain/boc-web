/**
 * 开发环境配置文件
 */
const configBase = {
  vault_address: '',
  underlying_address: '',
  chain_browser_url: '',
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
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
  underlying_address: "0x55d398326f99059fF775485246999027B3197955",
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
}

const config56 = {
  ...configBase,
  apy_server: 'http://localhost:4000',
  rpcUrl,
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
  underlying_address: "0x55d398326f99059fF775485246999027B3197955",
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER']
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