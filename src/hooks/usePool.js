import { useState } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'

// === Constants === //
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { useEffect } from 'react'
import { useCallback } from 'react'

const { BigNumber } = ethers

const usePool = (POOL_ADDRESS, POOL_SERVICE_ABI, userProvider) => {
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [supply, setSupply] = useState(BigNumber.from(0))
  const address = useUserAddress(userProvider)

  /**
   * addLiquidity to pool
   * @param {*} amount
   * @returns
   */
  const addLiquidity = useCallback(
    async amount => {
      const signer = userProvider.getSigner()
      const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)
      const poolContractWithUser = poolContract.connect(signer)
      const extendObj = {}
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await poolContractWithUser.estimateGas.addLiquidity(amount, address, 0)
        console.log('gas=', gas)
        if (isUndefined(gas)) return
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        extendObj.gasLimit = maxGasLimit
      }
      return poolContractWithUser.addLiquidity(amount, address, 0, {
        ...extendObj,
        from: address
      })
    },
    [address]
  )

  /**
   * removeLiquidity from pool
   * @param {*} amount
   * @returns
   */
  const removeLiquidity = useCallback(
    async amount => {
      const vaultContract = new ethers.Contract(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)
      const signer = userProvider.getSigner()
      const vaultContractWithSigner = vaultContract.connect(signer)

      const extendObj = {}
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.removeLiquidity(amount, address)
        if (isUndefined(gas)) return
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        extendObj.gasLimit = maxGasLimit
      }
      return vaultContractWithSigner.removeLiquidity(amount, address, {
        ...extendObj,
        from: address
      })
    },
    [address]
  )

  /**
   *
   */
  const queryBalance = useCallback(() => {
    //TODO:
    setBalance(BigNumber.from(0))
  }, [])

  /**
   *
   */
  const querySupply = useCallback(() => {
    //TODO:
    setSupply(BigNumber.from(0))
  }, [])

  useEffect(queryBalance, [queryBalance])

  useEffect(querySupply, [querySupply])

  return {
    balance,
    supply,
    // actions
    querySupply,
    queryBalance,
    addLiquidity,
    removeLiquidity
  }
}

export default usePool
