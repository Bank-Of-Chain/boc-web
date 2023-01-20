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
    POOL_SERVICE_ABI,
    CREDIT_FACADE_ABI,
    CREDIT_ADDRESS_ABI,
    STAKING_POOL_ABI,
    CREDIT_MANAGER_ABI,
    DIESEL_TOKEN_ABI

  try {
    VAULT_ABI = abiLoader(abiPrefix, 'vault-abi.json')
  } catch (error) {
    VAULT_ABI = []
  }

  try {
    CREDIT_ADDRESS_ABI = abiLoader(abiPrefix, 'credit-account-abi.json')
  } catch (error) {
    CREDIT_ADDRESS_ABI = []
  }

  try {
    POOL_SERVICE_ABI = abiLoader(abiPrefix, 'pool-service-abi.json')
  } catch (error) {
    POOL_SERVICE_ABI = []
  }

  try {
    STAKING_POOL_ABI = abiLoader(abiPrefix, 'staking-pool-abi.json')
  } catch (error) {
    STAKING_POOL_ABI = []
  }

  try {
    DIESEL_TOKEN_ABI = abiLoader(abiPrefix, 'diesel-token-abi.json')
  } catch (error) {
    DIESEL_TOKEN_ABI = []
  }

  try {
    CREDIT_FACADE_ABI = abiLoader(abiPrefix, 'credit-facade-abi.json')
  } catch (error) {
    CREDIT_FACADE_ABI = []
  }

  try {
    CREDIT_MANAGER_ABI = abiLoader(abiPrefix, 'credit-manager-abi.json')
  } catch (error) {
    CREDIT_MANAGER_ABI = []
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

  return {
    VAULT_ABI,
    CREDIT_FACADE_ABI,
    POOL_SERVICE_ABI,
    VAULT_BUFFER_ABI,
    PRICE_ORCALE_ABI,
    STAKING_POOL_ABI,
    DIESEL_TOKEN_ABI,
    CREDIT_MANAGER_ABI,
    CREDIT_ADDRESS_ABI,
    EXCHANGE_ADAPTER_ABI,
    EXCHANGE_AGGREGATOR_ABI
  }
}

export default useAbiResolver
