// === Utils === //
import isEmpty from 'lodash/isEmpty'
import findIndex from 'lodash/findIndex'

// === Constants === //
import { ABI_SEQUENCE } from '@/constants/abi'

function abiLoader(version, file) {
  try {
    const data = require(`./../abis/${version}/${file}`)
    return data
  } catch (error) {
    const array = ABI_SEQUENCE[version]
    const index = findIndex(array, i => i === version)
    if (index <= 0) {
      throw new Error('abi json file load failed:' + file)
    }
    return abiLoader(array[index - 1], file)
  }
}

function useAbiResolver(abiPrefix) {
  if (isEmpty(abiPrefix)) return {}

  let VAULT_BUFFER_ABI,
    VAULT_ABI,
    EXCHANGE_ADAPTER_ABI,
    PRICE_ORCALE_ABI,
    EXCHANGE_AGGREGATOR_ABI,
    VAULT_FACTORY_ABI,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER

  try {
    VAULT_ABI = abiLoader(abiPrefix, 'vault-abi.json')
  } catch (error) {
    VAULT_ABI = []
  }

  try {
    EXCHANGE_AGGREGATOR_ABI = abiLoader(abiPrefix, 'exchange-aggregator-abi.json')
  } catch (error) {
    EXCHANGE_AGGREGATOR_ABI = []
  }

  try {
    EXCHANGE_ADAPTER_ABI = abiLoader(abiPrefix, 'exchange-adapter-abi.json')
  } catch (error) {
    EXCHANGE_ADAPTER_ABI = []
  }

  try {
    PRICE_ORCALE_ABI = abiLoader(abiPrefix, 'price-oracle.json')
  } catch (error) {
    PRICE_ORCALE_ABI = []
  }

  try {
    VAULT_BUFFER_ABI = abiLoader(abiPrefix, 'vault-buffer.json')
  } catch (error) {
    VAULT_BUFFER_ABI = []
  }

  try {
    VAULT_FACTORY_ABI = abiLoader(abiPrefix, 'vault-factory.json')
  } catch (error) {
    VAULT_FACTORY_ABI = []
  }

  try {
    UNISWAPV3_RISK_ON_VAULT = abiLoader(abiPrefix, 'uniswapv3-risk-on-vault.json')
  } catch (error) {
    UNISWAPV3_RISK_ON_VAULT = []
  }

  try {
    UNISWAPV3_RISK_ON_HELPER = abiLoader(abiPrefix, 'uniswapv3-risk-on-helper.json')
  } catch (error) {
    UNISWAPV3_RISK_ON_HELPER = []
  }

  return {
    VAULT_ABI,
    VAULT_BUFFER_ABI,
    PRICE_ORCALE_ABI,
    VAULT_FACTORY_ABI,
    EXCHANGE_ADAPTER_ABI,
    EXCHANGE_AGGREGATOR_ABI,
    UNISWAPV3_RISK_ON_VAULT,
    UNISWAPV3_RISK_ON_HELPER
  }
}

export default useAbiResolver
