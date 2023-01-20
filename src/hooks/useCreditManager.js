import { useState, useCallback, useEffect } from 'react'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'
import { isZeroAddress } from '../helpers/token-utils'

const useCreditManager = (CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider) => {
  const [creditAddress, setCreditAddress] = useState('')

  const address = useUserAddress(userProvider)
  /**
   *
   */
  const getCreditAccountPegTokenAmount = useCallback(
    creditAccountAddress => {
      if (isEmpty(CREDIT_MANAGER_ADDRESS)) return
      if (isEmpty(CREDIT_MANAGER_ABI)) return
      if (isEmpty(userProvider)) return
      const creditManagerContract = new ethers.Contract(CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider)
      return creditManagerContract.getCreditAccountPegTokenAmount(creditAccountAddress)
    },
    [CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider]
  )

  /**
   *
   */
  const getCheckCloseCreditAccount = useCallback(
    creditAccountAddress => {
      if (isEmpty(CREDIT_MANAGER_ADDRESS)) return
      if (isEmpty(CREDIT_MANAGER_ABI)) return
      if (isEmpty(userProvider)) return
      const creditManagerContract = new ethers.Contract(CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider)
      return creditManagerContract.getCheckCloseCreditAccount(creditAccountAddress)
    },
    [CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider]
  )

  const getCreditAddress = useCallback(() => {
    if (isEmpty(CREDIT_MANAGER_ADDRESS)) return
    if (isEmpty(CREDIT_MANAGER_ABI)) return
    if (isEmpty(userProvider)) return
    if (isEmpty(address)) return
    const creditManagerContract = new ethers.Contract(CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, userProvider)
    return creditManagerContract.creditAccounts(address).then(v => {
      if (isZeroAddress(v)) return
      setCreditAddress(v)
    })
  }, [CREDIT_MANAGER_ADDRESS, CREDIT_MANAGER_ABI, address, userProvider])

  useEffect(() => {
    getCreditAddress()
  }, [getCreditAddress])

  return {
    creditAddress,
    getCreditAddress,
    getCheckCloseCreditAccount,
    getCreditAccountPegTokenAmount
  }
}

export default useCreditManager
