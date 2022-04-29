/**
 * 按版本解析abijson文件
 */
export default function resolver(abiPrefix) {
  const VAULT_ABI = require(`./../abis/${abiPrefix}/vault-abi.json`);
  const STRATEGY_ABI = require(`./../abis/${abiPrefix}/strategy-abi.json`);
  const IERC20_ABI = require(`./../abis/${abiPrefix}/ierc20-abi.json`);
  const TREASURE_ABI = require(`./../abis/${abiPrefix}/treasure-abi.json`);
  const EXCHANGE_AGGREGATOR_ABI = require(`./../abis/${abiPrefix}/exchange-aggregator-abi.json`);
  let USDI_ABI, EXCHANGE_ADAPTER_ABI;
  try {
    USDI_ABI = require(`./../abis/${abiPrefix}/usdi.json`);
  } catch (error) {
    USDI_ABI = []
  }

  try {
    EXCHANGE_ADAPTER_ABI = require(`./../abis/${abiPrefix}/exchange-adapter-abi.json`);
  } catch (error) {
    EXCHANGE_ADAPTER_ABI = []
  }
  return {
    USDI_ABI,
    VAULT_ABI,
    IERC20_ABI,
    STRATEGY_ABI,
    TREASURE_ABI,
    EXCHANGE_ADAPTER_ABI,
    EXCHANGE_AGGREGATOR_ABI,
  }
}