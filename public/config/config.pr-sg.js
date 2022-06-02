/**
 * 生产环境配置文件
 */
 const configBase = {
  vault_address: '',
  usdt_address: '',
  usdc_address: "",
  dai_address: "",
  abi_version: 'beta-v1.5',
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
  rpc_url: {
    '1': "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    '56': "https://bsc-dataseed.binance.org",
    '137': "https://polygon-rpc.com"
  },
  multiple_of_gas: 1,
  dashboard_url: 'https://dashboard.bankofchain.io',
  oracle_additional_slippage: 20,
  legacys: {}
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
  max_gas_limit: 1800 * 10 ** 4,
  chain_id: 137,
  vaults: [{
    id: 'invest',
    name: 'Vault for Stable Coins',
    path: '#/invest',
    abi_version: 'v4.6',
    VAULT_ADDRESS: '0x547382C0D1b23f707918D3c83A77317B71Aa8470',
  }, {
    id: 'mutilCoins',
    name: 'Vault for USDi',
    path: '#/mutils',
    isAudit: true,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0xd3feAe6c4fdfDE73Bd2fE99c8fE6944904DAA68A',
    USDI_ADDRESS: '0x8DEb399a86f28f62f0F24daF56c4aDD8e57EEcD5',
    isOpen: true
  }, {
    id: 'ethi',
    name: 'Vault for ETHi',
    description: '这是ethi的池子',
    path: '#/ethi',
    abi_version: 'ethi',
    VAULT_ADDRESS: '',
    ETHI_ADDRESS: '',
    WETHI_ADDRESS: '',
    isOpen: true
  }]
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
  max_gas_limit: 7200 * 10 ** 4,
  chain_id: 56,
  vaults: [{
    id: 'invest',
    name: 'Vault for Stable Coins',
    path: '#/invest',
    abi_version: 'v4.6',
    VAULT_ADDRESS: '0x547382C0D1b23f707918D3c83A77317B71Aa8470',
  }, {
    id: 'mutilCoins',
    name: 'Vault for USDi',
    path: '#/mutils',
    isAudit: true,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0x76609c83dD684F0D4c0F0c9849db0a1b5a96CAB2',
    USDI_ADDRESS: '0xCFC6E8577a414f561D459fC4a030e3463A500d29',
    isOpen: true
  }, {
    id: 'ethi',
    name: 'Vault for ETHi',
    description: '这是ethi的池子',
    path: '#/ethi',
    abi_version: 'ethi',
    VAULT_ADDRESS: '',
    ETHI_ADDRESS: '',
    WETHI_ADDRESS: '',
    isOpen: true
  }]
}


const config1 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'https://bankofchain.io/api/1',
  vault_address: "0xd5C7A01E49ab534e31ABcf63bA5a394fF1E5EfAC",
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  usdi_address: "0xBe15Eed7D8e91D20263d4521c9eB0F4e3510bfBF",
  chain_browser_url:'https://etherscan.io',
  exchange_extra_params: {
    oneInchV4: {
      network: 1,
      excludeProtocols: ['ONE_INCH_LIMIT_ORDER', 'ONE_INCH_LIMIT_ORDER_V2']
    },
    paraswap: {
      network: 1,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4'],
      excludeDEXS: ['acryptos']
    }
  },
  // ETH链一个区块3千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 2700 * 10 ** 4,
  chain_id: 1,
  vaults: [{
    id: 'invest',
    name: 'Vault for Stable Coins',
    path: '#/invest',
    abi_version: 'v4.6',
    VAULT_ADDRESS: '0x547382C0D1b23f707918D3c83A77317B71Aa8470',
  }, {
    id: 'mutilCoins',
    name: 'Vault for USDi',
    path: '#/mutils',
    isAudit: true,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0xd5C7A01E49ab534e31ABcf63bA5a394fF1E5EfAC',
    USDI_ADDRESS: '0xBe15Eed7D8e91D20263d4521c9eB0F4e3510bfBF',
    isOpen: true
  }, {
    id: 'ethi',
    name: 'Vault for ETHi',
    description: '这是ethi的池子',
    path: '#/ethi',
    abi_version: 'ethi',
    VAULT_ADDRESS: '0xDae16f755941cbC0C9D240233a6F581d1734DaA2',
    ETHI_ADDRESS: '0x8cB9Aca95D1EdebBfe6BD9Da4DC4a2024457bD32',
    WETHI_ADDRESS: '',
    isOpen: true
  }]
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
