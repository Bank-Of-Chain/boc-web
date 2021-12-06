const vaultAbi = require('./abis/vault-abi.json');
const strategyAbi = require('./abis/strategy-abi.json');
const ierc20Abi = require('./abis/ierc20-abi.json');
const treasureAbi = require('./abis/treasure-abi.json');
const exchangeAggreatorAbi = require('./abis/exchange-aggregator-abi.json');
// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "3be290dd5c1a46f894bdf28625c000ce";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// gas limit设置为平常的2倍
export const MULTIPLE_OF_GAS = 2;

// EXTERNAL CONTRACTS
export const ENV_NETWORK_TYPE = process.env.REACT_APP_NETWORK_TYPE || localStorage.REACT_APP_NETWORK_TYPE
const config = window.config[ENV_NETWORK_TYPE] || {}
console.log('env config=', ENV_NETWORK_TYPE, config);

// === configs === //
export const APY_SERVER = config.apy_server;
export const VAULT_ADDRESS = config.vault_address;
export const EXCHANGE_EXTRA_PARAMS = config.exchange_extra_params;
export const USDT_ADDRESS = config.underlying_address;
export const RPC_URL = config.rpcUrl;
export const CHAIN_BROWSER_URL = config.chain_browser_url;

export const COMMUNITY_URL = config.community_url;
export const ABOUTUS_URL = config.aboutus_url;
export const BLOG_URL = config.blog_url;
export const LICENSES_URL = config.licenses_url;
export const DOCUMENT_URL = config.document_url;

// === abi === //
export const VAULT_ABI = vaultAbi;

export const STRATEGY_ABI = strategyAbi;

export const IERC20_ABI = ierc20Abi;

export const EXCHANGE_AGGREGATOR_ABI = exchangeAggreatorAbi;

export const TREASURE_ABI = treasureAbi;

export const NET_WORKS = [{
    name: "Eth Mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/mainnet`,
    blockExplorer: "https://etherscan.io/",
  },
  {
    name: "Matic Mainnet",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com//",
  },
  {
    name: "BSC Mainnet",
    color: "#e0d068",
    chainId: 56,
    rpcUrl: `https://speedy-nodes-nyc.moralis.io/f2cbcaf720c374313b5543f8/bsc/mainnet/archive`,
    faucet: "",
    blockExplorer: "https://bscscan.com/",
  },
]