import { useState, useEffect } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

// === Constants === //
import { IERC20_ABI } from '@/constants'
import { ETH_ADDRESS } from '@/constants/tokens'
import { useCallback } from 'react'

const { BigNumber } = ethers

const useErc20Token = (tokenAddress, userProvider) => {
  const address = useUserAddress(userProvider)
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [decimals, setDecimals] = useState(1)
  const [loading, setLoading] = useState(false)

  const queryBalance = useCallback(async () => {
    let nextBalance = BigNumber.from(0)
    if (isEmpty(tokenAddress) || isEmpty(address)) {
      setBalance(nextBalance)
      setDecimals(1)
      return nextBalance
    }
    setLoading(true)
    if (tokenAddress === ETH_ADDRESS) {
      nextBalance = await userProvider.getBalance(address).finally(() => setLoading(false))
    } else {
      const tokenContract = new ethers.Contract(tokenAddress, IERC20_ABI, userProvider)
      nextBalance = await tokenContract.balanceOf(address).finally(() => setLoading(false))
    }
    setBalance(nextBalance)
    return nextBalance
  }, [tokenAddress, address])

  const queryDecimals = useCallback(() => {
    if (isEmpty(tokenAddress)) {
      setDecimals(1)
      return
    }
    if (tokenAddress === ETH_ADDRESS) {
      setDecimals(18)
      return
    }
    const tokenContract = new ethers.Contract(tokenAddress, IERC20_ABI, userProvider)
    tokenContract.decimals().then(setDecimals)
  }, [tokenAddress])

  const approve = async (targetAddress, amount) => {
    const tokenContract = new ethers.Contract(tokenAddress, IERC20_ABI, userProvider)
    const signer = userProvider.getSigner()

    const tokenContractWithUser = tokenContract.connect(signer)

    const allowanceAmount = await tokenContractWithUser.allowance(address, targetAddress)
    console.groupCollapsed('approve')
    console.log('targetAddress=', targetAddress)
    console.log('allowanceAmount=', allowanceAmount.toString())
    // If deposit amount greater than allow amount, reset amount
    if (amount.gt(allowanceAmount)) {
      // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
      if (allowanceAmount.gt(0)) {
        console.log('add allowance:', amount.sub(allowanceAmount).toString())
        console.groupEnd('approve')
        return tokenContractWithUser
          .increaseAllowance(targetAddress, amount.sub(allowanceAmount))
          .then(tx => tx.wait())
          .catch(e => {
            // cancel by user
            if (e.code === 4001) {
              return Promise.reject(e)
            }
            // If increase failed, approve 0 and approve nextAmounts
            return tokenContractWithUser
              .approve(targetAddress, 0)
              .then(tx => tx.wait())
              .then(() => tokenContractWithUser.approve(targetAddress, amount).then(tx => tx.wait()))
          })
      } else {
        console.log('current allowance:', allowanceAmount.toString(), 'next allowance:', amount.toString())
        console.groupEnd('approve')
        return tokenContractWithUser
          .approve(targetAddress, amount)
          .then(tx => tx.wait())
          .catch(e => {
            // cancel by user
            if (e.code === 4001) {
              return Promise.reject(e)
            }
          })
      }
    }
    console.groupEnd('approve')
  }

  useEffect(() => {
    queryBalance()
  }, [queryBalance])

  useEffect(() => {
    queryDecimals()
  }, [queryDecimals])

  return {
    balance,
    decimals,
    loading,
    // actions
    approve,
    queryBalance,
    queryDecimals
  }
}

export default useErc20Token
