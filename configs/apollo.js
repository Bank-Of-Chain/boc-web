const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));
const axios = require("axios");
const inquirer = require("inquirer");
const { isEmpty } = require("lodash");

const { env, chain } = argv;
let nextEnv = env;
let nextChain = chain;

const start = async () => {
  if (isEmpty(nextEnv)) {
    nextEnv = await chooseEnv();
  }
  if (isEmpty(nextChain)) {
    nextChain = await chooseLocalChainConfig();
  }

  const isLinux = process.platform === "linux";
  const host = isLinux ? "http://172.31.22.200" : "http://54.179.161.168";
  const url = `${host}:8088/configfiles/json/boc-subgraph/${nextEnv}/boc1.application`;
  const { status, data } = await axios.get(url).catch((error) => {
    console.error(`${nextEnv}配置加载失败，url=${url}`);
    return {
      status: 200,
      data: {
        "boc.networks.eth.vaultAddress": "",
        "boc.networks.eth.pegTokenAddress": "",
        "boc.networks.eth.vaultBufferAddress": "",
        "boc.networks.polygon.vaultAddress": "",
        "boc.networks.polygon.pegTokenAddress": "",
        "boc.networks.polygon.vaultBufferAddress": "",
        "boc.networks.ethi.vaultAddress": "",
        "boc.networks.ethi.pegTokenAddress": "",
        "boc.networks.ethi.vaultBufferAddress": "",
      },
    };
  });
  if (status === 200) {
    const USDI_VAULT_FOR_ETH = data["boc.networks.eth.vaultAddress"];
    const USDI_FOR_ETH = data["boc.networks.eth.pegTokenAddress"];
    const VAULT_BUFFER_FOR_USDI_ETH =
      data["boc.networks.eth.vaultBufferAddress"];

    const USDI_VAULT_FOR_MATIC = data["boc.networks.polygon.vaultAddress"];
    const USDI_FOR_MATIC = data["boc.networks.polygon.pegTokenAddress"];
    const VAULT_BUFFER_FOR_USDI_MATIC =
      data["boc.networks.polygon.vaultBufferAddress"];

    const ETHI_VAULT = data["boc.networks.ethi.vaultAddress"];
    const ETHI_FOR_ETH = data["boc.networks.ethi.pegTokenAddress"];
    const VAULT_BUFFER_FOR_ETHI_ETH =
      data["boc.networks.ethi.vaultBufferAddress"];
    let config = {
      env: nextEnv,
      LOCAL_CHAIN_CONFIG: nextChain,
      ETHI_FOR_ETH,
      USDI_FOR_ETH,
      USDI_FOR_MATIC,
      ETHI_VAULT,
      USDI_VAULT_FOR_ETH,
      USDI_VAULT_FOR_MATIC,
      VAULT_BUFFER_FOR_ETHI_ETH,
      VAULT_BUFFER_FOR_USDI_ETH,
      VAULT_BUFFER_FOR_USDI_MATIC,
      API_SERVER: getApiServer(),
      DASHBOARD_ROOT: getDashboardRoot(),
      RPC_FOR_1: getRpcFor1(),
      RPC_FOR_137: getRpcFor137(),
      RPC_FOR_31337: getRpcFor31337(),
      KEEPER_FOR_ETH_ETHI: getKeeperForEthEthi(),
      KEEPER_FOR_ETH_USDI: getKeeperForEthUsdi(),
      KEEPER_FOR_MATIC_USDI: getKeeperForMaticUsdi(),
    };

    fs.writeFileSync(
      `./configs/address.json`,
      JSON.stringify(config, undefined, 2)
    );
    console.log("write json success");
  }
};

const isPrSg = () => {
  return nextEnv === "pr-sg";
};

const isDevLocal = () => {
  return nextEnv === "dev-local";
};

const getApiServer = () => {
  if (isDevLocal()) return "http://localhost:8080";
  if (isPrSg()) return "https://service.bankofchain.io";
  return `https://service-${nextEnv}.bankofchain.io`;
};

const getDashboardRoot = () => {
  if (isDevLocal()) return "http://localhost:8000";
  if (isPrSg()) return "https://dashboard.bankofchain.io";
  return `https://dashboard-${nextEnv}.bankofchain.io`;
};

const getRpcFor1 = () => {
  if (isDevLocal()) return "http://localhost:8545";
  if (isPrSg()) return "https://rpc.ankr.com/eth";
  return `https://rpc-${nextEnv}.bankofchain.io`;
};

const getRpcFor137 = () => {
  if (isDevLocal()) return "http://localhost:8545";
  if (isPrSg()) return "https://rpc-mainnet.maticvigil.com";
  return `https://rpc-${nextEnv}.bankofchain.io`;
};
const getRpcFor31337 = () => {
  if (isDevLocal()) return "http://localhost:8545";
  if (isPrSg()) return "";
  return `https://rpc-${nextEnv}.bankofchain.io`;
};

const getKeeperForEthUsdi = () => {
  if (isDevLocal()) return "http://localhost:5000";
  if (isPrSg()) return "https://v1-keeper-eth.bankofchain.io";
  return `https://${nextEnv}-keeper-eth.bankofchain.io`;
};

const getKeeperForMaticUsdi = () => {
  if (isDevLocal()) return "http://localhost:3000";
  if (isPrSg()) return "https://v1-keeper-polygon.bankofchain.io";
  return `https://${nextEnv}-keeper-polygon.bankofchain.io`;
};

const getKeeperForEthEthi = () => {
  if (isDevLocal()) return "http://localhost:6000";
  if (isPrSg()) return "https://v1-keeper-ethi.bankofchain.io";
  return `https://${nextEnv}-keeper-ethi.bankofchain.io`;
};

const chooseEnv = () => {
  const questions = [
    {
      type: "list",
      name: "confirm",
      message: "请选择需要发布的环境：",
      choices: [
        {
          key: "dev-local",
          name: "dev-local",
          value: "dev-local",
        },
        {
          key: "qa-sg",
          name: "qa-sg",
          value: "qa-sg",
        },
        {
          key: "qa02-sg",
          name: "qa02-sg",
          value: "qa02-sg",
        },
        {
          key: "qa03-sg",
          name: "qa03-sg",
          value: "qa03-sg",
        },
        {
          key: "qa04-sg",
          name: "qa04-sg",
          value: "qa04-sg",
        },
        {
          key: "stage-sg",
          name: "stage-sg",
          value: "stage-sg",
        },
        {
          key: "pr-sg",
          name: "pr-sg(生产)",
          value: "pr-sg",
        },
      ],
    },
  ];
  return inquirer.prompt(questions).then((rs) => rs.confirm);
};

const chooseLocalChainConfig = () => {
  const questions = [
    {
      type: "list",
      name: "confirm",
      message: "请选择要发布的链：",
      choices: [
        {
          key: "config1",
          name: "以太链",
          value: "config1",
        },
        {
          key: "config137",
          name: "Matic链",
          value: "config137",
        },
        {
          key: "configBase",
          name: "跳过",
          value: "configBase",
        },
      ],
    },
  ];
  return inquirer.prompt(questions).then((rs) => rs.confirm);
};

try {
  start();
} catch (error) {
  process.exit(2);
}
