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
  const [creditAddress, setCreditAddress] = useState('')
  const [creditManagerAddress, setCreditManagerAddress] = useState('')
  const [poolAddress, setPoolAddress] = useState('')
  const [hasOpenedCreditAccount, setHasOpenedCreditAccount] = useState(undefined)
  const [borrowInterest, setBorrowInterest] = useState(0)
  const [vaultApy, setVaultApy] = useState(0)
  const [personalApy, setPersonalApy] = useState(600)

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
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).openCreditAccount(borrowedAmount, leverageFactor)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   * @returns
   */
  const closeCreditAccount = useCallback(() => {
    if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
    const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
    const signer = userProvider.getSigner()
    return creditFacadeContract.connect(signer).closeCreditAccount()
  }, [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider])

  /**
   *
   * @param {*} value
   */
  const increaseDebt = useCallback(
    value => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).increaseDebt(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   * @param {*} value
   */
  const decreaseDebt = useCallback(
    value => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).decreaseDebt(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const withdrawFromVault = useCallback(
    value => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).withdrawFromVault(value)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const addCollateral = useCallback(
    (assets, value, radio) => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).addCollateral(assets, value, radio)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const redeemCollateral = useCallback(
    paths => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).redeemCollateral(paths)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const distributePegTokenTicket = useCallback(
    creditAccountAddressArray => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      const signer = userProvider.getSigner()
      return creditFacadeContract.connect(signer).distributePegTokenTicket(creditAccountAddressArray)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const getCreditAccountPegTokenAmount = useCallback(
    creditAccountAddress => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      return creditFacadeContract.getCreditAccountPegTokenAmount(creditAccountAddress)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const getCheckCloseCreditAccount = useCallback(
    creditAccountAddress => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      return creditFacadeContract.getCheckCloseCreditAccount(creditAccountAddress)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const queryCreditAddress = useCallback(() => {
    if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(address) || isEmpty(userProvider)) return
    setIsCreditAddressLoading(true)
    const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
    creditFacadeContract
      .hasOpenedCreditAccount(address)
      .then(value => {
        setHasOpenedCreditAccount(value)
        if (value) {
          creditFacadeContract
            .getCreditAccount(address)
            .then(setCreditAddress)
            .catch(() => setCreditAddress(''))
        } else {
          setCreditAddress('')
        }
      })
      .catch(() => setHasOpenedCreditAccount(false))
      .finally(() => {
        setTimeout(() => {
          setIsCreditAddressLoading(false)
        }, 500)
      })

    creditFacadeContract.creditManager().then(setCreditManagerAddress)
  }, [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, address, userProvider])

  useEffect(queryCreditAddress, [queryCreditAddress])

  const queryBaseInfo = useCallback(
    creditAddress => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider) || isEmpty(creditAddress)) return
      const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      return creditFacadeContract.calcCreditAccountHealthFactor(creditAddress)
    },
    [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider]
  )

  /**
   *
   */
  const handleOpenCreditAccount = useCallback(
    sender => {
      if (sender === address) {
        queryCreditAddress()
      }
    },
    [queryCreditAddress, address]
  )

  /**
   *
   */
  const handleAddCollateral = useCallback(
    sender => {
      if (sender === address) {
        //TODO: add logics
      }
    },
    [queryCreditAddress, address]
  )

  /**
   *
   */
  const handleRedeemCollateral = useCallback(
    sender => {
      if (sender === address) {
        //TODO: add logics
      }
    },
    [queryCreditAddress, address]
  )

  useEffect(() => {
    const listener = () => {
      if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider) || isEmpty(address)) return
      const vaultContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
      vaultContract.on('OpenCreditAccount', handleOpenCreditAccount)
      vaultContract.on('CloseCreditAccount', handleOpenCreditAccount)
      vaultContract.on('AddCollateral', handleAddCollateral)
      vaultContract.on('RedeemCollateral', handleRedeemCollateral)

      return () => {
        vaultContract.off('OpenCreditAccount', handleOpenCreditAccount)
        vaultContract.off('CloseCreditAccount', handleOpenCreditAccount)
        vaultContract.off('AddCollateral', handleAddCollateral)
        vaultContract.off('RedeemCollateral', handleRedeemCollateral)
      }
    }
    return listener()
  }, [address, CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider, handleOpenCreditAccount])

  /**
   *
   */
  const queryPoolAddress = useCallback(() => {
    if (isEmpty(CREDIT_FACADE_ADDRESS) || isEmpty(CREDIT_FACADE_ABI) || isEmpty(userProvider)) return
    const creditFacadeContract = new ethers.Contract(CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider)
    creditFacadeContract
      .getLendingPool()
      .then(setPoolAddress)
      .catch(() => setPoolAddress(''))
  }, [CREDIT_FACADE_ADDRESS, CREDIT_FACADE_ABI, userProvider])

  useEffect(queryPoolAddress, [queryPoolAddress])

  return {
    creditAddress,
    isCreditAddressLoading,
    borrowInterest,
    vaultApy,
    personalApy,
    creditManagerAddress,
    hasOpenedCreditAccount,
    poolAddress,
    // actions
    openCreditAccount,
    closeCreditAccount,
    increaseDebt,
    decreaseDebt,
    addCollateral,
    withdrawFromVault,
    redeemCollateral,
    distributePegTokenTicket,
    queryBaseInfo,
    getCheckCloseCreditAccount,
    getCreditAccountPegTokenAmount
  }
}

export default useCreditFacade
