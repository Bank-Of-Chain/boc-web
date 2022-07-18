const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));
const axios = require("axios");

const { env } = argv;

const start = async () => {
  const host = "http://54.179.161.168";
  const url = `${host}:8088/configfiles/json/boc-subgraph/${env}/boc1.application`;
  console.log(`url: ${url}`);
  const { status, data } = await axios.get(url);
  if (status === 200) {
    const USDI_VAULT_FOR_ETH = data[`boc.networks.eth.vaultAddress`];
    const USDI_FOR_ETH = data[`boc.networks.eth.pegTokenAddress`];
    const VAULT_BUFFER_FOR_USDI_ETH =
      data[`boc.networks.eth.vaultBufferAddress`];

    const USDI_VAULT_FOR_BSC = data[`boc.networks.bsc.vaultAddress`];
    const USDI_FOR_BSC = data[`boc.networks.bsc.pegTokenAddress`];
    const VAULT_BUFFER_FOR_USDI_BSC =
      data[`boc.networks.bsc.vaultBufferAddress`];

    const USDI_VAULT_FOR_MATIC = data[`boc.networks.polygon.vaultAddress`];
    const USDI_FOR_MATIC = data[`boc.networks.polygon.pegTokenAddress`];
    const VAULT_BUFFER_FOR_USDI_MATIC =
      data[`boc.networks.polygon.vaultBufferAddress`];

    const ETHI_VAULT = data[`boc.networks.ethi.vaultAddress`];
    const ETHI_FOR_ETH = data[`boc.networks.ethi.pegTokenAddress`];
    const VAULT_BUFFER_FOR_ETHI_ETH =
      data[`boc.networks.ethi.vaultBufferAddress`];
    let config = {
      env,
      ETHI_FOR_ETH,
      USDI_FOR_ETH,
      USDI_FOR_BSC,
      USDI_FOR_MATIC,
      ETHI_VAULT,
      USDI_VAULT_FOR_ETH,
      USDI_VAULT_FOR_BSC,
      USDI_VAULT_FOR_MATIC,
      VAULT_BUFFER_FOR_ETHI_ETH,
      VAULT_BUFFER_FOR_USDI_ETH,
      VAULT_BUFFER_FOR_USDI_BSC,
      VAULT_BUFFER_FOR_USDI_MATIC,
      API_SERVER: getApiServer(),
      DASHBOARD_ROOT: getDashboardRoot(),
      RPC_FOR_1: getRpcFor1(),
      RPC_FOR_56: getRpcFor56(),
      RPC_FOR_137: getRpcFor137(),
      RPC_FOR_31337: getRpcFor31337(),
      KEEPER_FOR_ETH_ETHI: getKeeperForEthEthi(),
      KEEPER_FOR_ETH_USDI: getKeeperForEthUsdi(),
      KEEPER_FOR_BSC_USDI: getKeeperForBscUsdi(),
      KEEPER_FOR_MATIC_USDI: getKeeperForMaticUsdi(),
    };
    fs.writeFileSync(
      `./configs/address.json`,
      JSON.stringify(config, undefined, 4)
    );
    console.log("write json success");
  }
};

const isPrSg = () => {
  return env === "pr-sg";
};

const getApiServer = () => {
  if (isPrSg()) return "https://service.bankofchain.io";
  return `https://service-${env}.bankofchain.io`;
};

const getDashboardRoot = () => {
  if (isPrSg()) return "https://dashboard.bankofchain.io";
  return `https://dashboard-${env}.bankofchain.io`;
};

const getRpcFor1 = () => {
  if (isPrSg()) return "https://rpc.ankr.com/eth";
  return `https://rpc-${env}.bankofchain.io`;
};
const getRpcFor56 = () => {
  if (isPrSg()) return "https://bsc-dataseed.binance.org";
  return `https://rpc-${env}.bankofchain.io`;
};
const getRpcFor137 = () => {
  if (isPrSg()) return "https://rpc-mainnet.maticvigil.com";
  return `https://rpc-${env}.bankofchain.io`;
};
const getRpcFor31337 = () => {
  if (isPrSg()) return "";
  return `https://rpc-${env}.bankofchain.io`;
};

const getKeeperForEthUsdi = () => {
  if (isPrSg()) return "https://v1-keeper-eth.bankofchain.io";
  return `https://${env}-keeper-eth.bankofchain.io`;
};

const getKeeperForBscUsdi = () => {
  if (isPrSg()) return "https://v1-keeper-bsc.bankofchain.io";
  return `https://${env}-keeper-bsc.bankofchain.io`;
};

const getKeeperForMaticUsdi = () => {
  if (isPrSg()) return "https://v1-keeper-polygon.bankofchain.io";
  return `https://${env}-keeper-polygon.bankofchain.io`;
};

const getKeeperForEthEthi = () => {
  if (isPrSg()) return "https://v1-keeper-ethi.bankofchain.io";
  return `https://${env}-keeper-ethi.bankofchain.io`;
};

try {
  start();
} catch (error) {
  process.exit(2);
}
