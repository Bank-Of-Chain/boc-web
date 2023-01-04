/* eslint-disable */
import { useState } from 'react'

// === Utils === //
import * as ethers from 'ethers'

const { BigNumber } = ethers

const usePool = (POOL_ADDRESS, POOL_ABI, userProvider) => {
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [supply, setSupply] = useState(BigNumber.from(0))

  const deposit = value => {
    //TODO:
  }

  const withdraw = value => {
    //TODO:
  }

  return {
    balance,
    supply,
    // actions
    deposit,
    withdraw
  }
}

export default usePool
