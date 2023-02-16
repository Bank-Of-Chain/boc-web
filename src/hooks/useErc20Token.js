import { useState, useEffect, useCallback } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import noop from 'lodash/noop'
import isEmpty from 'lodash/isEmpty'

// === Constants === //
import { IERC20_ABI } from '@/constants'
import { ETH_ADDRESS, WETH_ADDRESS } from '@/constants/tokens'

const { BigNumber } = ethers

const useErc20Token = (tokenAddress, userProvider) => {
  const address = useUserAddress(userProvider)
  const [balance, setBalance] = useState(BigNumber.from(0))
  const [decimals, setDecimals] = useState(1)
  const [isBalanceloading, setIsBalanceloading] = useState(true)
  const [isDecimalsLoading, setIsDecimalsLoading] = useState(true)

  const balanceOf = useCallback(
    async address => {
      let nextBalance = BigNumber.from(0)
      if (isEmpty(tokenAddress) || isEmpty(address)) {
        return nextBalance
      }
      if (tokenAddress === ETH_ADDRESS) {
        nextBalance = await userProvider.getBalance(address)
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, IERC20_ABI, userProvider)
        nextBalance = await tokenContract.balanceOf(address)
      }
      return nextBalance
    },
    [tokenAddress, userProvider]
  )

  const queryBalance = useCallback(async () => {
    let nextBalance = BigNumber.from(0)
    if (isEmpty(tokenAddress) || isEmpty(address)) {
      setBalance(nextBalance)
      setDecimals(1)
      return nextBalance
    }
    setIsBalanceloading(true)

    nextBalance = await balanceOf(address)
    setBalance(nextBalance)
    setIsBalanceloading(false)
    return nextBalance
  }, [tokenAddress, address, balanceOf])

  const queryDecimals = useCallback(() => {
    if (isEmpty(tokenAddress)) {
      setDecimals(1)
      return
    }
    setIsDecimalsLoading(true)
    if (tokenAddress === ETH_ADDRESS) {
      setDecimals(18)
      setIsDecimalsLoading(false)
      return
    }
    const tokenContract = new ethers.Contract(tokenAddress, IERC20_ABI, userProvider)
    tokenContract
      .decimals()
      .then(setDecimals)
      .finally(() => setIsDecimalsLoading(false))
  }, [tokenAddress, userProvider])

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
      // WETH used increaseAllowance with no effect
      if (allowanceAmount.gt(0) && tokenAddress !== WETH_ADDRESS) {
        console.log('add allowance:', amount.sub(allowanceAmount).toString())
        console.groupEnd('approve')
        return tokenContractWithUser.increaseAllowance(targetAddress, amount.sub(allowanceAmount)).catch(e => {
          // cancel by user
          if (e.code === 4001) {
            return Promise.reject(e)
          }
          // If increase failed, approve 0 and approve nextAmounts
          return tokenContractWithUser
            .approve(targetAddress, 0)
            .then(() => tokenContractWithUser.approve(targetAddress, amount).then(tx => tx.wait()))
        })
      } else {
        console.log('current allowance:', allowanceAmount.toString(), 'next allowance:', amount.toString())
        console.groupEnd('approve')
        return tokenContractWithUser.approve(targetAddress, amount).catch(e => {
          // cancel by user
          if (e.code === 4001) {
            return Promise.reject(e)
          }
        })
      }
    }
    console.groupEnd('approve')
    return { wait: noop }
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
    loading: isBalanceloading && isDecimalsLoading,
    // actions
    approve,
    queryBalance,
    queryDecimals,
    balanceOf
  }
}

export default useErc20Token
