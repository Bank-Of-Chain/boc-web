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
    };
    fs.writeFileSync(
      `./configs/address.json`,
      JSON.stringify(config, undefined, 4)
    );
    console.log("write json success");
  }
};

try {
  start();
} catch (error) {
  process.exit(2);
}
