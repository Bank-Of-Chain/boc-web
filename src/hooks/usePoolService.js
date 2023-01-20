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
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [supply, setSupply] = useState(BigNumber.from(0))
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
    [address]
  )

  /**
   * removeLiquidity from pool
   * @param {*} amount
   * @returns
   */
  const removeLiquidity = useCallback(
    async amount => {
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

  /**
   *
   * @returns
   */
  const queryBorrowApy = useCallback(() => {
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
    console.log('queryAvailableLiquidity')
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.availableLiquidity().then(setAvailableLiquidity)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const queryTotalBorrowed = useCallback(() => {
    console.log('queryTotalBorrowed')
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.totalBorrowed().then(setTotalBorrowed)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  /**
   *
   * @returns
   */
  const queryFromDiesel = useCallback(() => {
    const poolServiceContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
    return poolServiceContract.fromDiesel(BigNumber.from(10).pow(18)).then(setFromDiesel)
  }, [POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  useEffect(queryBalance, [queryBalance])

  useEffect(querySupply, [querySupply])

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

  const handleMint = useCallback(() => {
    queryTotalBorrowed()
    queryAvailableLiquidity()
  }, [queryTotalBorrowed, queryAvailableLiquidity])

  const handleBurn = useCallback(() => {
    queryTotalBorrowed()
    queryAvailableLiquidity()
  }, [queryTotalBorrowed, queryAvailableLiquidity])

  useEffect(() => {
    const listener = () => {
      if (isEmpty(POOL_SERVICE_ADDRESS) || isEmpty(POOL_SERVICE_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)
      if (!isEmpty(address)) {
        vaultContract.on('AddLiquidity', handleMint)
        vaultContract.on('RemoveLiquidity', handleBurn)
        return () => {
          vaultContract.off('AddLiquidity', handleMint)
          vaultContract.off('RemoveLiquidity', handleBurn)
        }
      }
    }
    return listener()
  }, [address, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider])

  return {
    balance,
    supply,
    borrowApy,
    supplyApy,
    availableLiquidity,
    totalBorrowed,
    fromDiesel,
    // actions
    querySupply,
    queryBalance,
    addLiquidity,
    removeLiquidity,
    queryTotalBorrowed,
    queryAvailableLiquidity
  }
}

export default usePoolService
