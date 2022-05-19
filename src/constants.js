// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "3be290dd5c1a46f894bdf28625c000ce";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// EXTERNAL CONTRACTS
export const ENV_NETWORK_TYPE = process.env.REACT_APP_NETWORK_TYPE || localStorage.REACT_APP_NETWORK_TYPE
const config = window.config[ENV_NETWORK_TYPE] || window.config[undefined]
console.log('env config=', ENV_NETWORK_TYPE, config);

if (!config) {
  throw new Error('配置未正确加载');
}

// === configs === //
export const APY_SERVER = config.apy_server;
export const EXCHANGE_EXTRA_PARAMS = config.exchange_extra_params;
export const USDT_ADDRESS = config.usdt_address;
export const USDC_ADDRESS = config.usdc_address;
export const DAI_ADDRESS = config.dai_address;
export const CHAIN_BROWSER_URL = config.chain_browser_url;
export const TELEGRAM_URL = config.telegram_url;
export const SUB_GRAPH_URL = config.sub_graph_url;

export const COMMUNITY_URL = config.community_url;
export const ABOUTUS_URL = config.aboutus_url;
export const BLOG_URL = config.blog_url;
export const LICENSES_URL = config.licenses_url;
export const DOCUMENT_URL = config.document_url;
export const MAX_GAS_LIMIT = config.max_gas_limit;
export const BOC_SERVER = config.boc_server;
export const MULTIPLE_OF_GAS = config.multiple_of_gas;
export const DASHBOARD_URL = config.dashboard_url;
export const ORACLE_ADDITIONAL_SLIPPAGE = config.oracle_additional_slippage
export const VAULTS = config.vaults;
export const CHAIN_ID = config.chain_id;
export const LEGACYS = config.legacys;


export const NET_WORKS = [
  {
    name: "Ethereum",
    color: "#e0d068",
    chainId: 1,
    rpcUrl: `https://cloudflare-eth.com`,
    faucet: "",
    blockExplorer: "https://etherscan.io",
    blockExplorerIcon: "/images/chains/logo-etherscan.png",
  },
  {
    name: "BNB Chain",
    color: "#e0d068",
    chainId: 56,
    rpcUrl: `https://bsc-dataseed.binance.org/`,
    faucet: "",
    blockExplorer: "https://bscscan.com",
    blockExplorerIcon: "/images/chains/logo-bscscan.png",
  },
  {
    name: "Polygon",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://polygon-rpc.com/",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com",
    blockExplorerIcon: "/images/chains/logo-polygoncan.png",
  }
]

export const LOCAL_CHAIN_ID = 31337