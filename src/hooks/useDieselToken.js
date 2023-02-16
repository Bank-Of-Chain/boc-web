import { useState, useCallback, useEffect } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'
import useErc20Token from '@/hooks/useErc20Token'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

const { BigNumber } = ethers

const useDieselToken = (DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider) => {
  const erc20Data = useErc20Token(DIESEL_TOKEN_ADDRESS, userProvider)
  const [rewardAmounts, setRewardAmounts] = useState(BigNumber.from(0))

  const address = useUserAddress(userProvider)

  /**
   *
   */
  const getReward = useCallback(() => {
    if (isEmpty(DIESEL_TOKEN_ADDRESS)) return
    if (isEmpty(DIESEL_TOKEN_ABI)) return
    if (isEmpty(userProvider)) return
    const dieselTokenContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
    const signer = userProvider.getSigner()
    return dieselTokenContract.connect(signer).getReward()
  }, [DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider])

  /**
   *
   */
  const getEarned = useCallback(() => {
    if (isEmpty(DIESEL_TOKEN_ADDRESS)) return
    if (isEmpty(DIESEL_TOKEN_ABI)) return
    if (isEmpty(userProvider)) return
    if (isEmpty(address)) return
    const dieselTokenContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
    return dieselTokenContract.earned(address).then(setRewardAmounts)
  }, [DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, address, userProvider])

  /**
   *
   */
  const handleMint = useCallback(
    fromAccount => {
      if (fromAccount === address) {
        erc20Data.queryBalance()
      }
    },
    [erc20Data, address]
  )

  /**
   *
   */
  const handleBurn = useCallback(
    fromAccount => {
      if (fromAccount === address) {
        erc20Data.queryBalance()
      }
    },
    [erc20Data, address]
  )

  useEffect(() => {
    const listener = () => {
      if (isEmpty(DIESEL_TOKEN_ADDRESS) || isEmpty(DIESEL_TOKEN_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const dieselTokenContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
      if (!isEmpty(address)) {
        dieselTokenContract.on('Mint', handleMint)
        dieselTokenContract.on('Burn', handleBurn)
        dieselTokenContract.on('GetReward', getEarned)
        dieselTokenContract.on('NotifyRewardAmount', getEarned)
        return () => {
          dieselTokenContract.off('Mint', handleMint)
          dieselTokenContract.off('Burn', handleBurn)
          dieselTokenContract.off('GetReward', getEarned)
          dieselTokenContract.off('NotifyRewardAmount', getEarned)
        }
      }
    }
    return listener()
  }, [address, DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider, handleMint, handleBurn, getEarned])

  useEffect(() => {
    getEarned()
  }, [getEarned])

  return {
    ...erc20Data,
    rewardAmounts,
    // actions
    getEarned,
    getReward
  }
}

export default useDieselToken
