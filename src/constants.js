const vaultAbi = require('./abis/vault-abi.json');
const strategyAbi = require('./abis/strategy-abi.json');
const ierc20Abi = require('./abis/ierc20-abi.json');
const valueInterpreterAbi = require('./abis/value-interpreter-abi.json');
const exchangeAggreatorAbi = require('./abis/exchange-aggregator-abi.json');
// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "b5156ceaa4b644c49e74b1301121a6c6";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8";

// EXTERNAL CONTRACTS
const envNetworkType = process.env.REACT_APP_NETWORK_TYPE;
const config = window.config[envNetworkType || 'localhost']
console.log('config=', config);
export const VAULT_ADDRESS = config.vault_address;
export const APY_SERVER = config.apy_server;

export const VAULT_ABI = vaultAbi;

export const STRATEGY_ABI = strategyAbi;

export const IERC20_ABI = ierc20Abi;

export const EXCHANGE_AGGREGATOR_ABI = exchangeAggreatorAbi;

export const VALUE_INTERPRETER_ABI = valueInterpreterAbi;

export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
export const LUSD_ADDRESS = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'

export const NETWORK = chainId => {
  for (let n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://" + window.location.hostname + ":8545",
  },
  dev: {
    name: "dev",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://192.168.254.27:8545",
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
  },
  kovan: {
    name: "kovan",
    color: "#7003DD",
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
  rinkeby: {
    name: "rinkeby",
    color: "#e0d068",
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
  },
  ropsten: {
    name: "ropsten",
    color: "#F60D09",
    chainId: 3,
    faucet: "https://faucet.ropsten.be/",
    blockExplorer: "https://ropsten.etherscan.io/",
    rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
  },
  goerli: {
    name: "goerli",
    color: "#0975F6",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  },
  xdai: {
    name: "xdai",
    color: "#48a9a6",
    chainId: 100,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://dai.poa.network",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
  },
  matic: {
    name: "matic",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com//",
  },
  mumbai: {
    name: "mumbai",
    color: "#92D9FA",
    chainId: 80001,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://mumbai-explorer.matic.today/",
  },
};