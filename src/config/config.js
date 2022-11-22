/**
 * qa03-sg config
 */

const ETHI_FOR_ETH = '0x04F339eC4D75Cf2833069e6e61b60eF56461CD7C'

const USDI_FOR_ETH = '0x2d13826359803522cCe7a4Cfa2c1b582303DD0B4'
const USDI_FOR_MATIC = '0x8bA83450090a4F22649C5d01806d1C2679b1Ba98'

const ETHI_VAULT = '0x0724F18B2aA7D6413D3fDcF6c0c27458a8170Dd9'
const USDI_VAULT_FOR_ETH = '0x3a622DB2db50f463dF562Dc5F341545A64C580fc'
const USDI_VAULT_FOR_MATIC = '0xd3feAe6c4fdfDE73Bd2fE99c8fE6944904DAA68A'

const VAULT_BUFFER_FOR_ETHI_ETH = '0x92A00fc48Ad3dD4A8b5266a8F467a52Ac784fC83'
const VAULT_BUFFER_FOR_USDI_ETH = '0x124dDf9BdD2DdaD012ef1D5bBd77c00F05C610DA'
const VAULT_BUFFER_FOR_USDI_MATIC = '0x6eED2f58ed21a651CCc42Af123E243FaBad920E0'

const configBase = {
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
  boc_server: 'https://service-qa03-sg.bankofchain.io',
  rpc_url: {
    1: 'https://rpc-qa03-sg.bankofchain.io',
    137: 'https://rpc-qa03-sg.bankofchain.io',
    31337: 'https://rpc-qa03-sg.bankofchain.io'
  },
  multiple_of_gas: 2,
  dashboard_url: 'https://dashboard-qa03-sg.bankofchain.io',
  oracle_additional_slippage: 20
}

const config137 = {
  ...configBase,
  apy_server: 'https://qa03-sg-keeper-polygon.bankofchain.io',
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
    }
  ]
}

const config1 = {
  ...configBase,
  apy_server: 'https://qa03-sg-keeper-eth.bankofchain.io',
  ethi_keeper_server: 'https://qa03-sg-keeper-ethi.bankofchain.io',
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
  31337: glo['config1'],
  // polygon
  137: config137,
  // eth
  1: config1,
  [undefined]: configBase
}
