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
  rpcUrl: '',
  abi_version: 'v4.4',
  vault_address: "",
  underlying_address: "",
  exchange_extra_params: {
    oneInch: {
      network: 1,
      protocols: ['CURVE', 'CURVE_V2', 'SUSHI', 'UNISWAP_V2', 'UNISWAP_V3', 'DODO_V2', 'COMPOUND', 'AAVE', 'BALANCER', 'BANCOR', 'MSTABLE', 'AAVE_V2', 'BALANCER_V2']
    },
    paraswap: {
      network: 1,
      includeDEXS: 'UniswapV2,UniswapV3,SushiSwap,mStable,DODOV2,DODOV1,Curve,CurveV2,Compound,Bancor,BalancerV2,Aave2',
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