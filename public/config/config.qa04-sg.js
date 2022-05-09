/**
 * 测试环境配置文件
 */
 const configBase = {
  vault_address: "",
  usdt_address: "",
  usdc_address: "",
  dai_address: "",
  chain_browser_url: '',
  abi_version: 'v4.6',
  community_url: 'https://discord.com/channels/910840145039749141',
  telegram_url: 'https://t.me/joinchat/mSxXlD_it0QyNzll',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://docs.bankofchain.io",
  boc_server: 'http://service-qa04-sg.bankofchain.io',
  sub_graph_url: {
    '1': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-eth',
    '56': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-bsc',
    '137': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-matic'
  },
  multiple_of_gas: 2,
  dashboard_url: 'http://dashboard-qa04-sg.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'http://qa04-sg-keeper-polygon.bankofchain.io',
  vault_address: "0x204d2e5c581506e939295daf99079b590ace906e",
  usdt_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  usdc_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  dai_address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  usdi_address: "0x6dc1bebb8e0881aca6f082f5f53dd740c2ddf379",
  exchange_extra_params: {
    oneInchV4: {
      useHttp: true,
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
  apy_server: 'http://qa04-sg-keeper-bsc.bankofchain.io',
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
  usdt_address: "0x55d398326f99059fF775485246999027B3197955",
  usdc_address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  dai_address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  exchange_extra_params: {
    oneInchV4: {
      useHttp: true,
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
  apy_server: 'https://qa04-sg-keeper-eth.bankofchain.io',
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chain_browser_url: 'https://etherscan.io',
  exchange_extra_params: {
    oneInchV4: {
      useHttp: true,
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
  max_gas_limit: 2700 * 10 ** 4,
  vaults: [{
    id: 'invest',
    name: 'Vault for Stable Coins',
    description: '这是v1.1版本的Vault池',
    path: '#/invest',
    abi_version: 'v4.6',
    VAULT_ADDRESS: '0x547382C0D1b23f707918D3c83A77317B71Aa8470',
    dashboard_url: 'http://localhost:8000',
  }, {
    id: 'mutilCoins',
    name: 'Vault ( USD )',
    description: '这是v1.5版本的Vault池',
    path: '#/mutils',
    isAudit: false,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0x162700d1613DfEC978032A909DE02643bC55df1A',
    USDI_ADDRESS: '0x942ED2fa862887Dc698682cc6a86355324F0f01e',
    dashboard_url: 'http://localhost:8000',
    isOpen: true
  }, {
    id: 'ethi',
    name: 'Vault ( ETH )',
    description: '这是ethi的池子',
    path: '#/ethi',
    abi_version: 'ethi',
    VAULT_ADDRESS: '0xaC47e91215fb80462139756f43438402998E4A3a',
    ETHI_ADDRESS: '0xdFdE6B33f13de2CA1A75A6F7169f50541B14f75b',
    WETHI_ADDRESS: '',
    dashboard_url: 'http://dashboard-qa04-sg.bankofchain.io',
    isOpen: true
  }]
}

window.config = {
  // 本地链
  31337: config1,
  // polygon
  137: config137,
  // bsc
  56: config56,
  // eth
  1: config1,
  // 无链信息时的加载
  [undefined]: configBase
};