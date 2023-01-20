/* eslint-disable */
import { useState } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import { useEffect } from 'react'
import { isEmpty } from 'lodash'
import { useCallback } from 'react'

const { BigNumber } = ethers

const useCreditFacade = (CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider) => {
  const [creditManagerAddress, setCreditManagerAddress] = useState('')
  const [hasOpenedCreditAccount, setHasOpenedCreditAccount] = useState(undefined)
  const [borrowInterest, setBorrowInterest] = useState(0)
  const [vaultApy, setVaultApy] = useState(600)
  const [personalApy, setPersonalApy] = useState(0)

  // search if current user has created CreditAccount address
  const [isCreditAddressLoading, setIsCreditAddressLoading] = useState()

  const address = useUserAddress(userProvider)

  /**
   *
   * @param {*} borrowedAmount
   * @param {*} leverageFactor
   * @returns
   */
  const openCreditAccount = useCallback(
    (borrowedAmount, leverageFactor) => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract
        .connect(signer)
        .openCreditAccount(borrowedAmount, leverageFactor)
        .finally(() => queryCreditAddress())
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   * @returns
   */
  const closeCreditAccount = useCallback(() => {
    const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
    const signer = userProvider.getSigner()
    return creditPoolContract.connect(signer).closeCreditAccount()
  }, [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider])

  /**
   *
   * @param {*} value
   */
  const increaseDebt = useCallback(
    value => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).increaseDebt(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   * @param {*} value
   */
  const decreaseDebt = useCallback(
    value => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).decreaseDebt(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const withdrawFromVault = useCallback(
    value => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).withdrawFromVault(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const addCollateral = useCallback(
    (assets, value, radio) => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).addCollateral(assets, value, radio)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const redeemCollateral = useCallback(
    paths => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).redeemCollateral(paths)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const distributePegTokenTick = useCallback(
    creditAccountAddressArray => {
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditPoolContract.connect(signer).distributePegTokenTick(creditAccountAddressArray)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const queryCreditAddress = useCallback(() => {
    if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(address) || isEmpty(userProvider)) return
    setIsCreditAddressLoading(true)
    const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
    creditPoolContract
      .hasOpenedCreditAccount(address)
      .then(setHasOpenedCreditAccount)
      .catch(() => setHasOpenedCreditAccount(false))
      .finally(() => {
        setTimeout(() => {
          setIsCreditAddressLoading(false)
        }, 500)
      })

    creditPoolContract.creditManager().then(setCreditManagerAddress)
  }, [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, address, userProvider])

  useEffect(queryCreditAddress, [queryCreditAddress])

  const queryBaseInfo = useCallback(
    creditAddress => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(address) || isEmpty(userProvider) || isEmpty(creditAddress)) return
      const creditPoolContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      return creditPoolContract.calcCreditAccountHealthFactor(creditAddress)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, address, userProvider]
  )

  return {
    isCreditAddressLoading,
    borrowInterest,
    vaultApy,
    personalApy,
    creditManagerAddress,
    hasOpenedCreditAccount,
    // actions
    openCreditAccount,
    closeCreditAccount,
    increaseDebt,
    decreaseDebt,
    addCollateral,
    withdrawFromVault,
    redeemCollateral,
    distributePegTokenTick,
    queryBaseInfo
  }
}

export default useCreditFacade
