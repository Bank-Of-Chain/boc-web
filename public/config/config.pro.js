/**
 * 生产环境配置文件
 */
 const configBase = {
  vault_address: '',
  underlying_address: '',
  abi_version: 'v4.3',
  community_url: 'https://discord.gg/GjT2crrv',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://piggyfinance.github.io/docs/zh/docs/"
}

const config137 = {
  ...configBase,
  apy_server: 'https://bankofchain.io/api/137',
  rpcUrl: 'https://rpc-mainnet.maticvigil.com',
  vault_address: "0xFB7f340A7DEfD3bB0072844db6D5EbdFAD765dea",
  underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  chain_browser_url:'https://polygonscan.com',
  exchange_extra_params: {
    oneInch: {
      network: 137,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER', 'POLYGON_ONE_INCH_LIMIT_ORDER_V2']
    },
    oneInchV4: {
      network: 137,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER', 'POLYGON_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 137,
      excludeContractMethods: []
    }
  },
  // 币安链一个区块2千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 1800 * 10 ** 4
}

const config56 = {
  ...configBase,
  apy_server: 'https://bankofchain.io/api/56',
  rpcUrl: 'https://speedy-nodes-nyc.moralis.io/f2cbcaf720c374313b5543f8/bsc/mainnet/archive',
  vault_address: "0x699F86dd50224544E6c23670Af44682CAe9db3c5",
  abi_version: 'v4.4',
  underlying_address: "0x55d398326f99059fF775485246999027B3197955",
  chain_browser_url:'https://bscscan.com',
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER', 'BSC_ONE_INCH_LIMIT_ORDER_V2']
    },
    oneInchV4: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER', 'BSC_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: []
    }
  },
  // 币安链一个区块8千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 7200 * 10 ** 4
}


const config1 = {
  ...configBase,
  apy_server: 'https://bankofchain.io/api/1',
  rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  abi_version: 'v4.4',
  vault_address: "0x008586B7f6768EDc269D9e5cd276316d33CECE6d",
  underlying_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  exchange_extra_params: {
    oneInch: {
      network: 1,
      excludeProtocols: ['ONE_INCH_LIMIT_ORDER', 'ONE_INCH_LIMIT_ORDER_V2']
    },
    oneInchV4: {
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
  // polygon
  137: config137,
  // bsc
  56: config56,
  // eth
  1: config1
};
