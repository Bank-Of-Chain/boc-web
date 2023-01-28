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

  /**
   *
   */
  const handleTransfer = useCallback(
    (fromAccount, toAccount) => {
      if (fromAccount === address || toAccount === address) {
        erc20Data.queryBalance()
      }
    },
    [erc20Data, address]
  )

  useEffect(() => {
    const listener = () => {
      if (isEmpty(DIESEL_TOKEN_ADDRESS) || isEmpty(DIESEL_TOKEN_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)
      if (!isEmpty(address)) {
        vaultContract.on('Transfer', handleTransfer)
        return () => {
          vaultContract.off('Transfer', handleTransfer)
        }
      }
    }
    return listener()
  }, [address, DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider, handleTransfer])

  useEffect(() => {
    getEarned()
  }, [getEarned])

  return {
    ...erc20Data,
    rewardAmounts,
    // actions
    getReward
  }
}

export default useDieselToken
