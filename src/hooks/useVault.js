import { useState, useEffect, useCallback } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

// === Hooks === //
import useUserAddress from './useUserAddress'

const { Contract, BigNumber } = ethers

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
  const [pegTokenPrice, setPegTokenPrice] = useState(BigNumber.from(1))
  const [decimals, setDecimals] = useState(BigNumber.from(0))
  const [totalAsset, setTotalAsset] = useState(BigNumber.from(0))
  const [rebaseThreshold, setRebaseThreshold] = useState(BigNumber.from(0))
  const [underlyingUnitsPerShare, setUnderlyingUnitsPerShare] = useState(BigNumber.from(0))
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState(BigNumber.from(0))

  // ===
  const [isRedeemFeeBpsLoading, setIsRedeemFeeBpsLoading] = useState(false)
  const [isTrusteeFeeBpsLoading, setIsTrusteeFeeBpsLoading] = useState(false)
  const [redeemFeeBps, setRedeemFeeBps] = useState(BigNumber.from(0))
  const [trusteeFeeBps, setTrusteeFeeBps] = useState(BigNumber.from(0))
  const [isTotalAssetLoading, setIsTotalAssetLoading] = useState(false)

  // ===
  const [totalDebt, setTotalDebt] = useState(BigNumber.from(0))
  const [isTotalDebtLoading, setIsTotalDebtLoading] = useState(false)
  const [totalAssetsIncludeVaultBuffer, setTotalAssetsIncludeVaultBuffer] = useState(BigNumber.from(0))
  const [isTotalAssetsIncludeVaultBufferLoading, setIsTotalAssetsIncludeVaultBufferLoading] = useState(false)
  const [totalValueInVaultBuffer, setTotalValueInVaultBuffer] = useState(BigNumber.from(0))
  const [isTotalValueInVaultBufferLoading, setIsTotalValueInVaultBufferLoading] = useState(false)

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
  const getVaultContract = useCallback(() => {
    const error = valid()
    if (error) return
    return new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
  }, [valid, VAULT_ADDRESS, VAULT_ABI, userProvider])

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
    vaultContract.getPegTokenPrice().then(nextPegTokenPrice => {
      if (!nextPegTokenPrice.eq(pegTokenPrice)) {
        setPegTokenPrice(nextPegTokenPrice)
      }
    })
  }, [valid, VAULT_ADDRESS, VAULT_ABI, userProvider, pegTokenPrice])

  /**
   *
   */
  const queryTotalAssets = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsTotalAssetLoading(true)
    return vaultContract
      .totalAssets()
      .catch(() => ethers.BigNumber.from(0))
      .then(setTotalAsset)
      .finally(() => setIsTotalAssetLoading(false))
  }, [getVaultContract])
  /**
   *
   */
  const queryRedeemFeeBps = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsRedeemFeeBpsLoading(true)
    return vaultContract
      .redeemFeeBps()
      .then(setRedeemFeeBps)
      .finally(() => setIsRedeemFeeBpsLoading(false))
  }, [getVaultContract])

  /**
   *
   */
  const queryTrusteeFeeBps = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsTrusteeFeeBpsLoading(true)
    return vaultContract
      .trusteeFeeBps()
      .then(setTrusteeFeeBps)
      .finally(() => setIsTrusteeFeeBpsLoading(false))
  }, [getVaultContract])

  /**
   *
   */
  const queryTotalDebt = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsTotalDebtLoading(true)
    return vaultContract
      .totalDebt()
      .then(setTotalDebt)
      .finally(() => setIsTotalDebtLoading(false))
  }, [getVaultContract])

  /**
   *
   */
  const queryTotalAssetsIncludeVaultBuffer = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsTotalAssetsIncludeVaultBufferLoading(true)
    return vaultContract
      .totalAssetsIncludeVaultBuffer()
      .then(setTotalAssetsIncludeVaultBuffer)
      .finally(() => setIsTotalAssetsIncludeVaultBufferLoading(false))
  }, [getVaultContract])

  /**
   *
   */
  const queryTotalValueInVaultBuffer = useCallback(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    setIsTotalValueInVaultBufferLoading(true)
    return vaultContract
      .totalValueInVaultBuffer()
      .then(setTotalValueInVaultBuffer)
      .finally(() => setIsTotalValueInVaultBufferLoading(false))
  }, [getVaultContract])

  useEffect(() => {
    queryRedeemFeeBps()
  }, [queryRedeemFeeBps])

  useEffect(() => {
    queryTrusteeFeeBps()
  }, [queryTrusteeFeeBps])

  useEffect(() => {
    queryTotalAssets()
  }, [queryTotalAssets])

  useEffect(() => {
    queryTotalDebt()
  }, [queryTotalDebt])

  useEffect(() => {
    queryTotalAssetsIncludeVaultBuffer()
  }, [queryTotalAssetsIncludeVaultBuffer])

  useEffect(() => {
    queryTotalValueInVaultBuffer()
  }, [queryTotalValueInVaultBuffer])

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

  useEffect(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    vaultContract.on('RedeemFeeUpdated', queryRedeemFeeBps)
    return () => {
      vaultContract.off('RedeemFeeUpdated', queryRedeemFeeBps)
    }
  }, [getVaultContract, queryRedeemFeeBps])

  useEffect(() => {
    const vaultContract = getVaultContract()
    if (isEmpty(vaultContract)) return
    vaultContract.on('TrusteeFeeBpsChanged', queryTrusteeFeeBps)
    return () => {
      vaultContract.off('TrusteeFeeBpsChanged', queryTrusteeFeeBps)
    }
  }, [getVaultContract, queryTrusteeFeeBps])

  return {
    loading,
    error,
    totalAsset,
    isTotalAssetLoading,
    decimals,
    exchangeManager,
    pegTokenPrice,
    minimumInvestmentAmount,
    rebaseThreshold,
    underlyingUnitsPerShare,
    isRedeemFeeBpsLoading,
    isTrusteeFeeBpsLoading,
    redeemFeeBps,
    trusteeFeeBps,
    totalDebt,
    isTotalDebtLoading,
    totalAssetsIncludeVaultBuffer,
    isTotalAssetsIncludeVaultBufferLoading,
    totalValueInVaultBuffer,
    isTotalValueInVaultBufferLoading,
    // === actions === //
    queryTotalAssets,
    getPegTokenPrice,
    fetchUnderlyingUnitsPerShare,
    updateRebaseThreshold,
    updateMinimumInvestmentAmount,
    queryBaseInfo,
    queryTotalDebt,
    queryTotalAssetsIncludeVaultBuffer,
    queryTotalValueInVaultBuffer
  }
}

export default useVault
