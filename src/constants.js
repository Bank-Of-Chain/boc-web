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

const localNetworkCode = 31337
// EXTERNAL CONTRACTS
export const ENV_NETWORK_TYPE = process.env.REACT_APP_NETWORK_TYPE || localStorage.REACT_APP_NETWORK_TYPE || localNetworkCode;
const config = window.config[ENV_NETWORK_TYPE] || window.config[localNetworkCode]
console.log('env config=', ENV_NETWORK_TYPE, config);

export const APY_SERVER = config.apy_server;
export const VAULT_ADDRESS = config.vault_address;
export const EXCHANGE_EXTRA_PARAMS = config.exchange_extra_params;

export const VAULT_ABI = vaultAbi;

export const STRATEGY_ABI = strategyAbi;

export const IERC20_ABI = ierc20Abi;

export const EXCHANGE_AGGREGATOR_ABI = exchangeAggreatorAbi;

export const TREASURE_ABI = treasureAbi;


export const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
export const LUSD_ADDRESS = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'
