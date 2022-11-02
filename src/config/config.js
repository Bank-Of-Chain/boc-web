/**
 * pr02-sg config
 */

const ETHI_FOR_ETH = '0x1A597356E7064D4401110FAa2242bD0B51D1E4Fa'

const USDI_FOR_ETH = '0x83131242843257bc6C43771762ba467346Efb2CF'
const USDI_FOR_MATIC = ''

const ETHI_VAULT = '0x8f0Cb368C63fbEDF7a90E43fE50F7eb8B9411746'
const USDI_VAULT_FOR_ETH = '0x30D120f80D60E7b58CA9fFaf1aaB1815f000B7c3'
const USDI_VAULT_FOR_MATIC = ''

const VAULT_BUFFER_FOR_ETHI_ETH = '0xC8915157b36ed6D0F36827a1Bb5E9b0cDd1e87Cd'
const VAULT_BUFFER_FOR_USDI_ETH = '0x0b8D3634a05cc6b50E4D026c0eaFa8469cA98480'
const VAULT_BUFFER_FOR_USDI_MATIC = ''

const VAULT_FACTORY_ADDRESS = '0xA92C91Fe965D7497A423d951fCDFA221fC354B5a'

const configBase = {
  env: 'pr02-sg',
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
  boc_server: 'https://service-pr02-sg.bankofchain.io',
  rpc_url: {
    1: 'https://rpc.ankr.com/eth',
    137: 'https://rpc-mainnet.maticvigil.com',
    31337: ''
  },
  multiple_of_gas: 2,
  dashboard_url: 'https://risk-on-dashboard.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  apy_server: 'https://pr02-sg-keeper-polygon.bankofchain.io',
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
      id: 'usdi',
      name: 'Vault for USDi',
      path: '#/usdi',
      abi_version: 'usdi-v1.6.0',
      VAULT_ADDRESS: USDI_VAULT_FOR_MATIC,
      USDI_ADDRESS: USDI_FOR_MATIC,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_MATIC
    },
    {
      id: 'ethi',
      name: 'Vault for ETHi',
      description: 'Vault for ETHi',
      path: '#/ethi',
      abi_version: 'ethi-v1.6.0',
      VAULT_ADDRESS: '',
      ETHI_ADDRESS: '',
      VAULT_BUFFER_ADDRESS: ''
    },
    {
      id: 'ethr',
      name: 'Vault for ethr',
      path: '#/ethr',
      abi_version: 'ethr',
      VAULT_FACTORY_ADDRESS: VAULT_FACTORY_ADDRESS
    },
    {
      id: 'usdr',
      name: 'Vault for usdr',
      description: 'Vault for usdr',
      path: '#/usdr',
      abi_version: 'usdr',
      VAULT_FACTORY_ADDRESS: VAULT_FACTORY_ADDRESS
    }
  ]
}

const config1 = {
  ...configBase,
  apy_server: 'https://pr02-sg-keeper-eth.bankofchain.io',
  ethi_keeper_server: 'https://pr02-sg-keeper-ethi.bankofchain.io',
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
      id: 'usdi',
      name: 'Vault for USDi',
      path: '#/usdi',
      abi_version: 'usdi-v1.6.0',
      VAULT_ADDRESS: USDI_VAULT_FOR_ETH,
      USDI_ADDRESS: USDI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_ETH
    },
    {
      id: 'ethi',
      name: 'Vault for ETHi',
      description: 'Vault for ETHi',
      path: '#/ethi',
      abi_version: 'ethi-v1.6.0',
      VAULT_ADDRESS: ETHI_VAULT,
      ETHI_ADDRESS: ETHI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_ETHI_ETH
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
  31337: glo['config137'],
  // polygon
  137: config137,
  // eth
  1: config1,
  [undefined]: configBase
}
