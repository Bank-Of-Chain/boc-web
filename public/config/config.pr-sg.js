/**
 * 生产环境配置文件
 */
 const configBase = {
  vault_address: '',
  usdt_address: '',
  usdc_address: "",
  dai_address: "",
  abi_version: 'v4.6',
  community_url: 'https://discord.com/channels/910840145039749141',
  telegram_url: 'https://t.me/joinchat/mSxXlD_it0QyNzll',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://docs.bankofchain.io",
  boc_server: 'https://service-v1.bankofchain.io',
  sub_graph_url: {
    '1': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-eth',
    '56': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-bsc',
    '137': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-matic'
  },
  multiple_of_gas: 1,
  dashboard_url: 'https://dashboard-v1.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'https://v1-keeper-polygon.bankofchain.io',
  vault_address: "0xd3feAe6c4fdfDE73Bd2fE99c8fE6944904DAA68A",
  usdt_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  usdc_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  dai_address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  usdi_address: "0x8DEb399a86f28f62f0F24daF56c4aDD8e57EEcD5",
  chain_browser_url:'https://polygonscan.com',
  exchange_extra_params: {
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
  abi_version: 'beta-v1.5',
  apy_server: 'https://v1-keeper-bsc.bankofchain.io',
  vault_address: "0x76609c83dD684F0D4c0F0c9849db0a1b5a96CAB2",
  usdi_address: "0xCFC6E8577a414f561D459fC4a030e3463A500d29",
  usdt_address: "0x55d398326f99059fF775485246999027B3197955",
  usdc_address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  dai_address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  chain_browser_url:'https://bscscan.com',
  exchange_extra_params: {
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
  vault_address: "0x008586B7f6768EDc269D9e5cd276316d33CECE6d",
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chain_browser_url:'https://etherscan.io',
  exchange_extra_params: {
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
  1: config1,
  // 无链信息时的加载
  [undefined]: configBase
};
