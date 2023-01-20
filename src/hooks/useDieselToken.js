import { useState, useCallback, useEffect } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

const { BigNumber } = ethers

const useDieselToken = (DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider) => {
  const [rewardAmounts, setRewardAmounts] = useState(BigNumber.from(0))

  const address = useUserAddress(userProvider)

  /**
   *
   */
  const getReward = useCallback(() => {
    if (isEmpty(DIESEL_TOKEN_ADDRESS)) return
    if (isEmpty(DIESEL_TOKEN_ABI)) return
    if (isEmpty(userProvider)) return
    const creditManagerContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
    return creditManagerContract.getReward(address)
  }, [DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, address, userProvider])

  /**
   *
   */
  const getEarned = useCallback(() => {
    if (isEmpty(DIESEL_TOKEN_ADDRESS)) return
    if (isEmpty(DIESEL_TOKEN_ABI)) return
    if (isEmpty(userProvider)) return
    if (isEmpty(address)) return
    const creditManagerContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
    return creditManagerContract.earned(address).then(setRewardAmounts)
  }, [DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, address, userProvider])

  useEffect(() => {
    getEarned()
  }, [getEarned])

  return {
    rewardAmounts,
    // actions
    getReward
  }
}

export default useDieselToken
