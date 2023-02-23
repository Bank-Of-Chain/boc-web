import { useState, useEffect, useCallback } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

// === Hooks === //
import useUserAddress from './useUserAddress'

const { Contract } = ethers

/**
 *
 * @param {*} VAULT_ADDRESS
 * @param {*} VAULT_ABI
 * @param {*} userProvider
 * @returns
 */
const useVault = (VAULT_ADDRESS, VAULT_ABI, userProvider) => {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [exchangeManager, setExchangeManager] = useState('')
  const [pegTokenPrice, setPegTokenPrice] = useState(ethers.BigNumber.from(1))
  const [decimals, setDecimals] = useState(ethers.BigNumber.from(0))
  const [totalAsset, setTotalAsset] = useState(ethers.BigNumber.from(0))
  const [rebaseThreshold, setRebaseThreshold] = useState(ethers.BigNumber.from(0))
  const [underlyingUnitsPerShare, setUnderlyingUnitsPerShare] = useState(ethers.BigNumber.from(0))
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState(ethers.BigNumber.from(0))

  const address = useUserAddress(userProvider)

  /**
   *
   */
  const valid = useCallback(() => {
    if (isEmpty(VAULT_ADDRESS)) return new Error('VAULT_ADDRESS is need!')
    if (isEmpty(VAULT_ABI)) return new Error('VAULT_ABI is need!')
    if (isEmpty(userProvider)) return new Error('userProvider is need!')
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider])

  /**
   *
   */
  const fetchUnderlyingUnitsPerShare = useCallback(() => {
    if (isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI) || isEmpty(userProvider)) return
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    setLoading(true)
    vaultContract
      .underlyingUnitsPerShare()
      .catch(setError)
      .then(setUnderlyingUnitsPerShare)
      .finally(() => setLoading(false))
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider])

  /**
   * query vault base info
   * @returns
   */
  const queryBaseInfo = useCallback(() => {
    const error = valid()
    if (error) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const requestArray = [
      vaultContract.totalAssets().catch(() => ethers.BigNumber.from(0)),
      vaultContract.totalDebt().catch(() => ethers.BigNumber.from(0)),
      vaultContract.rebaseThreshold().catch(() => ethers.BigNumber.from(0)),
      vaultContract.minimumInvestmentAmount(),
      vaultContract.exchangeManager(),
      fetchUnderlyingUnitsPerShare()
    ]
    return Promise.all(requestArray)
      .then(([totalAsset, decimals, rebaseThreshold, minimumInvestmentAmount, exchangeManager]) => {
        setTotalAsset(totalAsset)
        setDecimals(decimals)
        setRebaseThreshold(rebaseThreshold)
        setMinimumInvestmentAmount(minimumInvestmentAmount)
        setExchangeManager(exchangeManager)
        return {
          totalAsset,
          decimals,
          rebaseThreshold
        }
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider, fetchUnderlyingUnitsPerShare, valid])

  /**
   *
   * @param {*} value
   * @returns
   */
  const updateRebaseThreshold = value => {
    const error = valid()
    if (error) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    vaultContract
      .connect(signer)
      .setRebaseThreshold(value)
      .then(tx => tx.wait())
      .finally(() => setLoading(false))
  }

  /**
   *
   * @param {*} value
   * @returns
   */
  const updateMinimumInvestmentAmount = value => {
    const error = valid()
    if (error) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    vaultContract
      .connect(signer)
      .setMinimumInvestmentAmount(value)
      .then(tx => tx.wait())
      .finally(() => setLoading(false))
  }

  /**
   *
   */
  const getPegTokenPrice = useCallback(() => {
    const error = valid()
    if (error) return setError(error)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    vaultContract.getPegTokenPrice().then(setPegTokenPrice)
  }, [valid, VAULT_ADDRESS, VAULT_ABI, userProvider])

  useEffect(getPegTokenPrice, [getPegTokenPrice])

  useEffect(() => {
    const error = valid()
    if (error) {
      setLoading(false)
      setError()
      return
    }
    queryBaseInfo()
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider, queryBaseInfo, valid])

  return {
    loading,
    error,
    totalAsset,
    decimals,
    exchangeManager,
    pegTokenPrice,
    getPegTokenPrice,
    minimumInvestmentAmount,
    fetchUnderlyingUnitsPerShare,
    rebaseThreshold,
    queryBaseInfo,
    updateRebaseThreshold,
    updateMinimumInvestmentAmount,
    underlyingUnitsPerShare
  }
}

export default useVault
