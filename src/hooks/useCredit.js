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

const useCredit = (CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider) => {
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [creditAddress, setCreditAddress] = useState('')
  const [hasOpenedCreditAccount, setHasOpenedCreditAccount] = useState(undefined)
  const [mortgageAmount, setMortgageAmount] = useState(BigNumber.from(0))

  const [debtAmount, setDebtAmount] = useState(BigNumber.from(0))

  const [healthRatio, setHealthRatio] = useState(0)
  const [leverRatio, setLeverRatio] = useState(0)
  const [borrowInterest, setBorrowInterest] = useState(0)
  const [vaultApy, setVaultApy] = useState(0)
  const [personalApy, setPersonalApy] = useState(0)

  const address = useUserAddress(userProvider)

  /**
   *
   * @param {*} borrowedAmount
   * @param {*} leverageFactor
   * @returns
   */
  const openCreditAccount = (borrowedAmount, leverageFactor) => {
    const creditPoolContract = new ethers.Contract(CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider)
    const signer = userProvider.getSigner()
    return creditPoolContract.connect(signer).openCreditAccount(borrowedAmount, leverageFactor).then(queryCreditAddress)
  }

  /**
   *
   * @returns
   */
  const closeCreditAccount = () => {
    const creditPoolContract = new ethers.Contract(CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider)
    const signer = userProvider.getSigner()
    return creditPoolContract.connect(signer).closeCreditAccount()
  }

  /**
   *
   * @param {*} value
   */
  const increaseDebt = value => {
    const creditPoolContract = new ethers.Contract(CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider)
    const signer = userProvider.getSigner()
    creditPoolContract.connect(signer).increaseDebt(address)
  }

  /**
   *
   * @param {*} value
   */
  const decreaseDebt = value => {
    const creditPoolContract = new ethers.Contract(CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider)
    const signer = userProvider.getSigner()
    creditPoolContract.connect(signer).decreaseDebt(address)
  }

  /**
   *
   */
  const withdrawFromVault = () => {}

  /**
   *
   */
  const addCollateral = () => {}

  /**
   *
   * @param {*} value
   * @returns
   */
  const leverRatioUpdate = value => {
    return 0
  }

  /**
   *
   */
  const queryCreditAddress = useCallback(() => {
    if (isEmpty(CREDIT_POOL_ADDRESS) || isEmpty(CREDIT_POOL_ABI) || isEmpty(address) || isEmpty(userProvider)) return
    const creditPoolContract = new ethers.Contract(CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider)
    creditPoolContract
      .hasOpenedCreditAccount(address)
      .then(setHasOpenedCreditAccount)
      .catch(() => setHasOpenedCreditAccount(false))
  }, [CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, address, userProvider])

  useEffect(queryCreditAddress, [queryCreditAddress])

  return {
    balance,
    mortgageAmount,
    creditAddress,
    debtAmount,
    healthRatio,
    leverRatio,
    borrowInterest,
    vaultApy,
    personalApy,
    hasOpenedCreditAccount,
    // actions
    openCreditAccount,
    closeCreditAccount,
    increaseDebt,
    decreaseDebt,
    addCollateral,
    withdrawFromVault,
    leverRatioUpdate
  }
}

export default useCredit
