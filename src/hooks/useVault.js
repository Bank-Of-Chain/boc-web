/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"

// === Utils === //
import * as ethers from "ethers"
import isEmpty from "lodash/isEmpty"

// === Hooks === //
import { useUserAddress } from "eth-hooks"

const { Contract } = ethers

const useVault = (VAULT_ADDRESS, VAULT_ABI, userProvider) => {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [decimals, setDecimals] = useState(ethers.BigNumber.from(0))
  const [totalAsset, setTotalAsset] = useState(ethers.BigNumber.from(0))
  const [rebaseThreshold, setRebaseThreshold] = useState(ethers.BigNumber.from(0))
  const [underlyingUnitsPerShare, setUnderlyingUnitsPerShare] = useState(ethers.BigNumber.from(0))
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState(ethers.BigNumber.from(0))

  const address = useUserAddress(userProvider)

  const valid = () => {
    if (isEmpty(VAULT_ADDRESS)) return new Error("VAULT_ADDRESS is need!")
    if (isEmpty(VAULT_ABI)) return new Error("VAULT_ABI is need!")
    if (isEmpty(userProvider)) return new Error("userProvider is need!")
  }

  /**
   * 查询vault的基础信息
   * @returns
   */
  const queryBaseInfo = () => {
    const error = valid()
    if (!isEmpty(error)) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const requestArray = [
      vaultContract.totalAssets().catch(() => ethers.BigNumber.from(0)),
      vaultContract.totalDebt().catch(() => ethers.BigNumber.from(0)),
      vaultContract.rebaseThreshold().catch(() => ethers.BigNumber.from(0)),
      vaultContract.minimumInvestmentAmount(),
      fetchUnderlyingUnitsPerShare(),
    ]
    return Promise.all(requestArray)
      .then(([totalAsset, decimals, rebaseThreshold, minimumInvestmentAmount]) => {
        setTotalAsset(totalAsset)
        setDecimals(decimals)
        setRebaseThreshold(rebaseThreshold)
        setMinimumInvestmentAmount(minimumInvestmentAmount)
        return {
          totalAsset,
          decimals,
          rebaseThreshold,
        }
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  const updateRebaseThreshold = value => {
    const error = valid()
    if (!isEmpty(error)) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    vaultContract
      .connect(signer)
      .setRebaseThreshold(value)
      .then(tx => tx.wait())
      .finally(() => setLoading(false))
  }

  const updateMinimumInvestmentAmount = value => {
    const error = valid()
    if (!isEmpty(error)) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    vaultContract
      .connect(signer)
      .setMinimumInvestmentAmount(value)
      .then(tx => tx.wait())
      .finally(() => setLoading(false))
  }

  const fetchUnderlyingUnitsPerShare = () => {
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    setLoading(true)
    vaultContract
      .underlyingUnitsPerShare()
      .catch(setError)
      .then(setUnderlyingUnitsPerShare)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const error = valid()
    if (!isEmpty(error)) {
      setLoading(false)
      setError()
      return
    }
    queryBaseInfo()
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  return {
    loading,
    error,
    totalAsset,
    decimals,
    minimumInvestmentAmount,
    fetchUnderlyingUnitsPerShare,
    rebaseThreshold,
    queryBaseInfo,
    updateRebaseThreshold,
    updateMinimumInvestmentAmount,
    underlyingUnitsPerShare,
  }
}

export default useVault
