// === Utils === //
import isEmpty from "lodash/isEmpty";

export default function resolver(abiPrefix) {
  if (isEmpty(abiPrefix)) return {};

  let VAULT_BUFFER_ABI,
    VAULT_ABI,
    EXCHANGE_ADAPTER_ABI,
    PRICE_ORCALE_ABI,
    EXCHANGE_AGGREGATOR_ABI;

  try {
    VAULT_ABI = require(`./../abis/${abiPrefix}/vault-abi.json`);
  } catch (error) {
    VAULT_ABI = [];
  }

  try {
    EXCHANGE_AGGREGATOR_ABI = require(`./../abis/${abiPrefix}/exchange-aggregator-abi.json`);
  } catch (error) {
    EXCHANGE_AGGREGATOR_ABI = [];
  }

  try {
    EXCHANGE_ADAPTER_ABI = require(`./../abis/${abiPrefix}/exchange-adapter-abi.json`);
  } catch (error) {
    EXCHANGE_ADAPTER_ABI = [];
  }

  try {
    PRICE_ORCALE_ABI = require(`./../abis/${abiPrefix}/price-oracle.json`);
  } catch (error) {
    PRICE_ORCALE_ABI = [];
  }

  try {
    VAULT_BUFFER_ABI = require(`./../abis/${abiPrefix}/vault-buffer.json`);
  } catch (error) {
    VAULT_BUFFER_ABI = [];
  }

  return {
    VAULT_ABI,
    VAULT_BUFFER_ABI,
    PRICE_ORCALE_ABI,
    EXCHANGE_ADAPTER_ABI,
    EXCHANGE_AGGREGATOR_ABI,
  };
}
