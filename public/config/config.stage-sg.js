/**
 * 预生产环境配置文件
 */
 const configBase = {
  vault_address: '',
  usdt_address: '',
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
  boc_server: 'http://service-stage-sg.bankofchain.io',
  sub_graph_url: {
    '1': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-eth',
    '56': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-bsc',
    '137': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-matic'
  },
  multiple_of_gas: 2,
  dashboard_url: 'http://dashboard-stage-sg.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'http://192.168.60.12/api/137',
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
  usdt_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  usdc_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  dai_address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  usdi_address: "",
  exchange_extra_params: {
    oneInchV4: {
      network: 137,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER', 'POLYGON_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 137,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
  // 币安链一个区块2千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 1800 * 10 ** 4,
  chain_id: 137,
}

const config56 = {
  ...configBase,
  apy_server: 'http://192.168.60.12/api/56',
  vault_address: "0x2C328D592819524F741A88A18572372CCE196782",
  usdt_address: "0x55d398326f99059fF775485246999027B3197955",
  usdc_address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  dai_address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  exchange_extra_params: {
    oneInchV4: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER', 'BSC_ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
    }
  },
  // 币安链一个区块8千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 7200 * 10 ** 4,
  chain_id: 56,
}

const config1 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'http://stage-sg-keeper-eth.bankofchain.io',
  vault_address: "0x9BcC604D4381C5b0Ad12Ff3Bf32bEdE063416BC7",
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  usdi_address: "0xf090f16dEc8b6D24082Edd25B1C8D26f2bC86128",
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
  chain_id: 1,
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
