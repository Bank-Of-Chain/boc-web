/**
 * qa-sg config
 */

const ETHI_FOR_ETH = '0x89372b32b8AF3F1272e2efb3088616318D2834cA'

const USDI_FOR_ETH = '0xe044814c9eD1e6442Af956a817c161192cBaE98F'
const USDI_FOR_MATIC = '0x8bA83450090a4F22649C5d01806d1C2679b1Ba98'

const ETHI_VAULT = '0x6D712CB50297b97b79dE784d10F487C00d7f8c2C'
const USDI_VAULT_FOR_ETH = '0xB7ca895F81F20e05A5eb11B05Cbaab3DAe5e23cd'
const USDI_VAULT_FOR_MATIC = '0xd3feAe6c4fdfDE73Bd2fE99c8fE6944904DAA68A'

const VAULT_BUFFER_FOR_ETHI_ETH = '0x21915b79E1d334499272521a3508061354D13FF0'
const VAULT_BUFFER_FOR_USDI_ETH = '0x0F527785e39B22911946feDf580d87a4E00465f0'
const VAULT_BUFFER_FOR_USDI_MATIC = '0x6eED2f58ed21a651CCc42Af123E243FaBad920E0'

const SUBGRAPH_URL_ETHI = ''
const SUBGRAPH_URL_USDI = ''
const SUBGRAPH_URL_MATIC_USDI = 'https:&#x2F;&#x2F;qa-sg-subgraph.bankofchain.io&#x2F;subgraphs&#x2F;name&#x2F;boc-v1_5&#x2F;subgraph-eth'

const configBase = {
  env: 'qa-sg',
  usdt_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdc_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  dai_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  chain_browser_url: '',
  abi_version: 'beta-v1.5',
  community_url: 'https://discord.gg/y9RZVaGFEf',
  telegram_url: 'https://t.me/bankofchain',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  twitter_url: 'https://twitter.com/bankofchain_dao',
  linkedin_url: 'https://www.linkedin.com/company/bank-of-chain/',
  youtube_url: 'https://www.youtube.com/channel/UCnACZpYuAksuSeoLniDXlOQ/featured',
  medium_url: 'https://medium.com/bankofchain',
  document_url: 'https://docs.bankofchain.io',
  github_url: 'https://github.com/Bank-Of-Chain',
  boc_server: 'https://service-qa-sg.bankofchain.io',
  rpc_url: {
    1: 'https://rpc-qa-sg.bankofchain.io',
    137: 'https://rpc-qa-sg.bankofchain.io',
    31337: 'https://rpc-qa-sg.bankofchain.io'
  },
  multiple_of_gas: 2,
  dashboard_url: 'https://dashboard-qa-sg.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  apy_server: 'https://qa-sg-keeper-polygon.bankofchain.io',
  usdt_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  usdc_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  dai_address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
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
  max_gas_limit: 1800 * 10 ** 4,
  chain_id: 137,
  vaults: [
    {
      id: 'mutilCoins',
      name: 'Vault for USDi',
      path: '#/usdi',
      abi_version: 'usdi-v1.6.0',
      VAULT_ADDRESS: USDI_VAULT_FOR_MATIC,
      USDI_ADDRESS: USDI_FOR_MATIC,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_MATIC,
      SUBGRAPH_URL: SUBGRAPH_URL_MATIC_USDI
    },
    {
      id: 'ethi',
      name: 'Vault for ETHi',
      description: 'Vault for ETHi',
      path: '#/ethi',
      abi_version: 'ethi-v1.6.0',
      VAULT_ADDRESS: '',
      ETHI_ADDRESS: '',
      VAULT_BUFFER_ADDRESS: '',
      SUBGRAPH_URL: ''
    }
  ]
}

const config1 = {
  ...configBase,
  apy_server: 'https://qa-sg-keeper-eth.bankofchain.io',
  ethi_keeper_server: 'https://qa-sg-keeper-ethi.bankofchain.io',
  usdt_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdc_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  dai_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  chain_browser_url: 'https://etherscan.io',
  exchange_extra_params: {
    oneInchV4: {
      network: 1,
      excludeProtocols: ['ONE_INCH_LIMIT_ORDER', 'ONE_INCH_LIMIT_ORDER_V2', 'ZEROX_LIMIT_ORDER', 'PMM1', 'PMM2', 'PMM3', 'PMM4']
    },
    paraswap: {
      network: 1,
      excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4'],
      excludeDEXS: 'acryptos',
      includeDEXS:
        'Uniswap,Kyber,Bancor,Oasis,Compound,Fulcrum,0x,MakerDAO,Chai,Aave,Aave2,MultiPath,MegaPath,Curve,Curve3,Saddle,IronV2,BDai,idle,Weth,Beth,UniswapV2,Balancer,0xRFQt,SushiSwap,LINKSWAP,Synthetix,DefiSwap,Swerve,CoFiX,Shell,DODOV1,DODOV2,OnChainPricing,PancakeSwap,PancakeSwapV2,ApeSwap,Wbnb,streetswap,bakeryswap,julswap,vswap,vpegswap,beltfi,ellipsis,QuickSwap,COMETH,Wmatic,Nerve,Dfyn,UniswapV3,Smoothy,PantherSwap,OMM1,OneInchLP,CurveV2,mStable,WaultFinance,MDEX,ShibaSwap,CoinSwap,SakeSwap,JetSwap,Biswap,BProtocol'
    }
  },
  multiple_of_gas: 1.2,
  max_gas_limit: 2700 * 10 ** 4,
  chain_id: 1,
  vaults: [
    {
      id: 'mutilCoins',
      name: 'Vault for USDi',
      path: '#/usdi',
      abi_version: 'usdi-v1.6.0',
      VAULT_ADDRESS: USDI_VAULT_FOR_ETH,
      USDI_ADDRESS: USDI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_ETH,
      SUBGRAPH_URL: SUBGRAPH_URL_USDI
    },
    {
      id: 'ethi',
      name: 'Vault for ETHi',
      description: 'Vault for ETHi',
      path: '#/ethi',
      abi_version: 'ethi-v1.6.0',
      VAULT_ADDRESS: ETHI_VAULT,
      ETHI_ADDRESS: ETHI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_ETHI_ETH,
      SUBGRAPH_URL: SUBGRAPH_URL_ETHI
    }
  ]
}

const glo = {
  configBase,
  config137,
  config1
}
export default {
  // local
  31337: glo['config1'],
  // polygon
  137: config137,
  // eth
  1: config1,
  [undefined]: configBase
}
