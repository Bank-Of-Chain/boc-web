import { useCallback } from 'react'
// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash-es/isEmpty'

const { Contract } = ethers

const usePriceProvider = params => {
  const { userProvider, VAULT_ADDRESS, VAULT_ABI, PRICE_ORCALE_ABI } = params

  const getPriceProvider = useCallback(async () => {
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS)) {
      throw new Error('userProvider or VAULT_ADDRESS is empty')
    }
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    return vaultContract.valueInterpreter().then(priceOracleAddress => {
      const priceOracleContract = new Contract(priceOracleAddress, PRICE_ORCALE_ABI, userProvider)
      return priceOracleContract
    })
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider, PRICE_ORCALE_ABI])

  return {
    getPriceProvider
  }
}

export default usePriceProvider
