import genConfig from '@/config/config'

// === Utils === //
import get from 'lodash/get'

// EXTERNAL CONTRACTS
export const ENV_NETWORK_TYPE = get(process, 'env.REACT_APP_NETWORK_TYPE', localStorage.REACT_APP_NETWORK_TYPE)
const config = genConfig[ENV_NETWORK_TYPE] || genConfig[undefined]
console.log('env config=', ENV_NETWORK_TYPE, config)

if (!config) {
  throw new Error('load config error')
}

// === configs === //
export const APY_SERVER = config.apy_server
export const EXCHANGE_EXTRA_PARAMS = config.exchange_extra_params
export const USDT_ADDRESS = config.usdt_address
export const USDC_ADDRESS = config.usdc_address
export const DAI_ADDRESS = config.dai_address
export const CHAIN_BROWSER_URL = config.chain_browser_url
export const TELEGRAM_URL = config.telegram_url
export const SUB_GRAPH_URL = config.sub_graph_url

export const COMMUNITY_URL = config.community_url
export const ABOUTUS_URL = config.aboutus_url
export const BLOG_URL = config.blog_url
export const LICENSES_URL = config.licenses_url
export const DOCUMENT_URL = config.document_url
export const MAX_GAS_LIMIT = config.max_gas_limit
export const BOC_SERVER = config.boc_server
export const MULTIPLE_OF_GAS = config.multiple_of_gas
export const DASHBOARD_URL = config.dashboard_url
export const ORACLE_ADDITIONAL_SLIPPAGE = config.oracle_additional_slippage
export const VAULTS = config.vaults
export const CHAIN_ID = config.chain_id
export const LEGACYS = config.legacys
export const RPC_URL = config.rpc_url
export const TWITTER_URL = config.twitter_url
export const LINKEDIN_URL = config.linkedin_url
export const YOUTUBE_URL = config.youtube_url
export const MEDIUM_URL = config.medium_url
export const GITHUB_URL = config.github_url

export const POLYGON_HIDDEN = true

export const NET_WORKS = POLYGON_HIDDEN
  ? [
      {
        name: 'Ethereum',
        color: '#e0d068',
        chainId: 1,
        rpcUrl: `https://cloudflare-eth.com`,
        faucet: '',
        blockExplorer: 'https://etherscan.io',
        blockExplorerIcon: '/images/chains/logo-etherscan.png'
      }
    ]
  : [
      {
        name: 'Ethereum',
        color: '#e0d068',
        chainId: 1,
        rpcUrl: `https://cloudflare-eth.com`,
        faucet: '',
        blockExplorer: 'https://etherscan.io',
        blockExplorerIcon: '/images/chains/logo-etherscan.png'
      },
      {
        name: 'Polygon',
        color: '#2bbdf7',
        chainId: 137,
        price: 1,
        gasPrice: 1000000000,
        rpcUrl: 'https://polygon-rpc.com/',
        faucet: 'https://faucet.matic.network/',
        blockExplorer: 'https://explorer-mainnet.maticvigil.com',
        blockExplorerIcon: '/images/chains/logo-polygoncan.png'
      }
    ]

export const LOCAL_CHAIN_ID = 31337

export const IERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: 'spender',
        type: 'address'
      },
      {
        name: 'addedValue',
        type: 'uint256'
      }
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool'
      }
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_spender',
        type: 'address'
      }
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address'
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address'
      },
      {
        indexed: true,
        name: 'to',
        type: 'address'
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  }
]

// TODO: because exchangeManager in v2.0 has none adapter, so use the exchangeManager contract deploy on v1.6.9. Zhangyi's suggestion
export const EXCHANGE_MANAGER = '0x921FE3dF4F2073f0d4d0B839B6068460397a04f9'

export const ONE_INCH_ROUTER = '0x1111111254EEB25477B68fb85Ed929f73A960582'
export const PARA_ROUTER = '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57'
export const PARA_TRANSFER_PROXY = '0x216B4B4Ba9F3e719726886d34a177484278Bfcae'
