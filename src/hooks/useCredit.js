/* eslint-disable */
import { useState } from 'react'

// === Utils === //
import * as ethers from 'ethers'

const { BigNumber } = ethers

const useCredit = (CREDIT_POOL_ADDRESS, CREDIT_POOL_ABI, userProvider) => {
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [creditAddress, setCreditAddress] = useState('11')
  const [mortgageAmount, setMortgageAmount] = useState(BigNumber.from(0))

  const [debtAmount, setDebtAmount] = useState(BigNumber.from(0))

  const [healthRatio, setHealthRatio] = useState(0)
  const [leverRatio, setLeverRatio] = useState(0)
  const [borrowInterest, setBorrowInterest] = useState(0)
  const [vaultApy, setVaultApy] = useState(0)
  const [personalApy, setPersonalApy] = useState(0)

  const connect = () => {
    //TODO:
  }

  const unConnect = () => {
    //TODO:
  }

  const deposit = value => {
    //TODO:
  }

  const withdraw = value => {
    //TODO:
  }

  const leverRatioUpdate = value => {
    return 0
  }

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
    // actions
    connect,
    unConnect,
    deposit,
    withdraw,
    leverRatioUpdate
  }
}

export default useCredit
