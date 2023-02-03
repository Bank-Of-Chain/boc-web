import { useState, useEffect, useCallback } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'

const { BigNumber } = ethers

const usePoolService = (POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider) => {
  const [totalBorrowed, setTotalBorrowed] = useState(BigNumber.from(0))
  const [availableLiquidity, setAvailableLiquidity] = useState(BigNumber.from(0))
  const [borrowApy, setBorrowApy] = useState(0)
  const [supplyApy, setSupplyApy] = useState(0)
  const [fromDiesel, setFromDiesel] = useState(BigNumber.from(0))
  const address = useUserAddress(userProvider)

  /**
   * addLiquidity to pool
   * @param {*} amount
   * @returns
   */
  const addLiquidity = useCallback(
    async amount => {
      if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
      const signer = userProvider.getSigner()
      const poolContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
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
    [address, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider]
  )

  /**
   * removeLiquidity from pool
   * @param {*} amount
   * @returns
   */
  const removeLiquidity = useCallback(
    async amount => {
      if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
      const vaultContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
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
    [address, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider]
  )

  /**
   *
   * @returns
   */
  const queryBorrowApy = useCallback(() => {
    if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.borrowAPY().then(v => {
      const nextValue = Number(toFixed(v, BigNumber.from(10).pow(25), 2))
      setBorrowApy(nextValue)
      return nextValue
    })
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const querySupplyApy = useCallback(() => {
    if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.supplyAPY().then(v => {
      const nextValue = Number(toFixed(v, BigNumber.from(10).pow(25), 2))
      setSupplyApy(nextValue)
      return nextValue
    })
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const queryAvailableLiquidity = useCallback(() => {
    if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.availableLiquidity().then(setAvailableLiquidity)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const queryTotalBorrowed = useCallback(() => {
    if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.totalBorrowed().then(setTotalBorrowed)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const queryFromDiesel = useCallback(() => {
    if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider)) return
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.fromDiesel(BigNumber.from(10).pow(18)).then(setFromDiesel)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   */
  const handleAddLiquidity = useCallback(() => {
    queryTotalBorrowed()
    queryAvailableLiquidity()
  }, [queryTotalBorrowed, queryAvailableLiquidity])

  /**
   *
   */
  const handleRemoveLiquidity = useCallback(() => {
    queryTotalBorrowed()
    queryAvailableLiquidity()
  }, [queryTotalBorrowed, queryAvailableLiquidity])

  useEffect(() => {
    queryAvailableLiquidity()
  }, [queryAvailableLiquidity])

  useEffect(() => {
    queryTotalBorrowed()
  }, [queryTotalBorrowed])

  useEffect(() => {
    queryBorrowApy()
  }, [queryBorrowApy])

  useEffect(() => {
    querySupplyApy()
  }, [querySupplyApy])

  useEffect(() => {
    queryFromDiesel()
  }, [queryFromDiesel])

  useEffect(() => {
    const listener = () => {
      if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
      if (!isEmpty(address)) {
        vaultContract.on('AddLiquidity', handleAddLiquidity)
        vaultContract.on('RemoveLiquidity', handleRemoveLiquidity)
        return () => {
          vaultContract.off('AddLiquidity', handleAddLiquidity)
          vaultContract.off('RemoveLiquidity', handleRemoveLiquidity)
        }
      }
    }
    return listener()
  }, [address, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider, handleAddLiquidity, handleRemoveLiquidity])

  return {
    borrowApy,
    supplyApy,
    availableLiquidity,
    totalBorrowed,
    fromDiesel,
    // actions
    addLiquidity,
    removeLiquidity,
    queryTotalBorrowed,
    queryAvailableLiquidity
  }
}

export default usePoolService
