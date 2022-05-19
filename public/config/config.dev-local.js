/**
 * 开发环境配置文件
 */
const configBase = {
  vault_address: '',
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chain_browser_url: '',
  abi_version: 'beta-v1.5',
  community_url: 'https://discord.com/channels/910840145039749141',
  telegram_url: 'https://t.me/joinchat/mSxXlD_it0QyNzll',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://docs.bankofchain.io",
  boc_server: 'http://192.168.60.12/server',
  sub_graph_url: {
    '1': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-eth',
    '56': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-bsc',
    '137': 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-subgraph-matic'
  },
  multiple_of_gas: 2,
  dashboard_url: 'http://localhost:8000',
  oracle_additional_slippage: 20,
  vaults: [],
  legacys: { title: 'legacys', url: 'https://legacy-v1-web.bankofchain.io' }
}

const config137 = {
  ...configBase,
  abi_version: 'beta-v1.5',
  apy_server: 'http://localhost:3000',
  usdt_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  usdc_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  dai_address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
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
  max_gas_limit: 1800 * 10 ** 4,
  chain_id: 137,
  vaults: [{
    id: 'mutilCoins',
    name: 'Vault for USDi',
    path: '#/mutils',
    isAudit: true,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0x70eE76691Bdd9696552AF8d4fd634b3cF79DD529',
    USDI_ADDRESS: '0xcD0048A5628B37B8f743cC2FeA18817A29e97270',
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
  apy_server: 'http://localhost:4000',
  vault_address: "0xFEE2d383Ee292283eC43bdf0fa360296BE1e1149",
  usdi_address: "0xE3e7A4B35574Ce4b9Bc661cD93e8804Da548932a",
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
  max_gas_limit: 7200 * 10 ** 4,
  chain_id: 56,
  vaults: [{
    id: 'mutilCoins',
    name: 'Vault for USDi',
    path: '#/mutils',
    isAudit: true,
    abi_version: 'beta-v1.5',
    VAULT_ADDRESS: '0x70eE76691Bdd9696552AF8d4fd634b3cF79DD529',
    USDI_ADDRESS: '0xcD0048A5628B37B8f743cC2FeA18817A29e97270',
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
  apy_server: 'http://localhost:5000',
  vault_address: "0x38A70c040CA5F5439ad52d0e821063b0EC0B52b6",
  usdi_address: "0xe039608E695D21aB11675EBBA00261A0e750526c",
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  exchange_extra_params: {
    oneInchV4: {
      useHttp: true,
      network: 1,
      protocols: 'CURVE_V2,SUSHI,CURVE,UNISWAP_V2,UNISWAP_V3,BALANCER,BALANCER_V2,ETH_BANCOR_V3,CURVE_V2_ETH_PAL,POOLTOGETHER,SYNAPSE,CURVE_V2_THRESHOLDNETWORK_2_ASSET,CURVE_V2_YFI_2_ASSET,CURVE_V2_SPELL_2_ASSET,WSTETH,CURVE_V2_XAUT_2_ASSET,CURVE_V2_ETH_CVX,SYNTHETIX_WRAPPER,FIXED_FEE_SWAP_V3,CURVE_V2_ETH_CRV,DEFI_PLAZA,ONE_INCH_LP_MIGRATOR,SUSHISWAP_MIGRATOR,UNISWAP_V2_MIGRATOR,ONE_INCH_LP_MIGRATOR_V1_1,ONE_INCH_LP_1_1,LINKSWAP,ONE_INCH_LP,AAVE_V2,SYNTHETIX,AAVE_LIQUIDATOR,MSTABLE,MINISWAP,BANCOR,CREAMSWAP,COMPOUND,MOONISWAP,WETH,CURVE_V2_EURT_2_ASSET,CURVE_V2_EURT_3_ASSET'
    },
    paraswap: {
      network: 1,
      includeDEXS: 'Uniswap,Bancor,Compound,MakerDAO,ParaSwapPool,Aave,Aave2,MultiPath,MegaPath,Curve,Curve3,Saddle,IronV2,idle,Weth,Beth,UniswapV2, Balancer,ParaSwapPool2,ParaSwapPool3,ParaSwapPool4,ParaSwapPool5,ParaSwapPool6,SushiSwap,LINKSWAP,Synthetix,DefiSwap,PancakeSwap, PancakeSwapV2,ApeSwap,Wbnb,beltfi,ellipsis,QuickSwap,Wmatic,UniswapV3,PantherSwap,OneInchLP,CurveV2,WaultFinance,MDEX,ShibaSwap, CoinSwap',
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4']
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
    VAULT_ADDRESS: '0x70eE76691Bdd9696552AF8d4fd634b3cF79DD529',
    USDI_ADDRESS: '0xcD0048A5628B37B8f743cC2FeA18817A29e97270',
    isOpen: true
  }, {
    id: 'ethi',
    name: 'Vault for ETHi',
    description: '这是ethi的池子',
    path: '#/ethi',
    abi_version: 'ethi',
    VAULT_ADDRESS: '0xaC47e91215fb80462139756f43438402998E4A3a',
    ETHI_ADDRESS: '0xdFdE6B33f13de2CA1A75A6F7169f50541B14f75b',
    WETHI_ADDRESS: '',
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