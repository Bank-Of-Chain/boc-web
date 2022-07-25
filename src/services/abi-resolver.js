// === Utils === //
import isEmpty from "lodash/isEmpty";

/**
 * 按版本解析abijson文件
 */
export default function resolver(abiPrefix) {
  if (isEmpty(abiPrefix)) return {};
  let USDI_ABI,
    EXCHANGE_ADAPTER_ABI,
    VAULT_ABI,
    STRATEGY_ABI,
    IERC20_ABI,
    TREASURE_ABI,
    EXCHANGE_AGGREGATOR_ABI,
    ETHI_ABI,
    DRIPPER_ABI,
    HARVESTER_ABI,
    PRICE_ORCALE_ABI,
    ACCESS_CONTROL_PROXY,
    VAULT_BUFFER_ABI;

  try {
    VAULT_ABI = require(`./../abis/${abiPrefix}/vault-abi.json`);
  } catch (error) {
    VAULT_ABI = [];
  }

  try {
    STRATEGY_ABI = require(`./../abis/${abiPrefix}/strategy-abi.json`);
  } catch (error) {
    STRATEGY_ABI = [];
  }

  try {
    IERC20_ABI = require(`./../abis/${abiPrefix}/ierc20-abi.json`);
  } catch (error) {
    IERC20_ABI = [];
  }
  try {
    TREASURE_ABI = require(`./../abis/${abiPrefix}/treasure-abi.json`);
  } catch (error) {
    TREASURE_ABI = [];
  }
  try {
    EXCHANGE_AGGREGATOR_ABI = require(`./../abis/${abiPrefix}/exchange-aggregator-abi.json`);
  } catch (error) {
    EXCHANGE_AGGREGATOR_ABI = [];
  }

  try {
    USDI_ABI = require(`./../abis/${abiPrefix}/usdi.json`);
  } catch (error) {
    USDI_ABI = [];
  }

  try {
    EXCHANGE_ADAPTER_ABI = require(`./../abis/${abiPrefix}/exchange-adapter-abi.json`);
  } catch (error) {
    EXCHANGE_ADAPTER_ABI = [];
  }

  try {
    ETHI_ABI = require(`./../abis/${abiPrefix}/ethi-abi.json`);
  } catch (error) {
    ETHI_ABI = [];
  }

  try {
    DRIPPER_ABI = require(`./../abis/${abiPrefix}/dripper-abi.json`);
  } catch (error) {
    DRIPPER_ABI = [];
  }

  try {
    HARVESTER_ABI = require(`./../abis/${abiPrefix}/harvester-abi.json`);
  } catch (error) {
    HARVESTER_ABI = [];
  }

  try {
    PRICE_ORCALE_ABI = require(`./../abis/${abiPrefix}/price-oracle.json`);
  } catch (error) {
    PRICE_ORCALE_ABI = [];
  }

  try {
    ACCESS_CONTROL_PROXY = require(`./../abis/${abiPrefix}/access-control-proxy-abi.json`);
  } catch (error) {
    ACCESS_CONTROL_PROXY = [];
  }

  try {
    VAULT_BUFFER_ABI = require(`./../abis/${abiPrefix}/vault-buffer.json`);
  } catch (error) {
    VAULT_BUFFER_ABI = [];
  }

  return {
    ETHI_ABI,
    USDI_ABI,
    VAULT_ABI,
    IERC20_ABI,
    DRIPPER_ABI,
    TREASURE_ABI,
    STRATEGY_ABI,
    HARVESTER_ABI,
    VAULT_BUFFER_ABI,
    PRICE_ORCALE_ABI,
    ACCESS_CONTROL_PROXY,
    EXCHANGE_ADAPTER_ABI,
    EXCHANGE_AGGREGATOR_ABI,
  };
}
