import { useState, useEffect } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

// === Hooks === //
import useUserAddress from './useUserAddress'

const { Contract, BigNumber } = ethers

const useVaultOnRisk = (VAULT_ADDRESS, VAULT_ABI, userProvider) => {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [totalAsset, setTotalAsset] = useState(BigNumber.from(0))
  const [underlyingUnitsPerShare, setUnderlyingUnitsPerShare] = useState(BigNumber.from(0))
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState(BigNumber.from(0))

  const address = useUserAddress(userProvider)

  const valid = () => {
    if (isEmpty(VAULT_ADDRESS)) return new Error('VAULT_ADDRESS is need!')
    if (isEmpty(VAULT_ABI)) return new Error('VAULT_ABI is need!')
    if (isEmpty(userProvider)) return new Error('userProvider is need!')
  }

  /**
   * query vault base info
   * @returns
   */
  const queryBaseInfo = () => {
    const error = valid()
    if (error) return setError(error)
    setLoading(true)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const requestArray = [
      vaultContract.depositTo3rdPoolTotalAssets().catch(() => BigNumber.from(0)),
      // vaultContract.minimumInvestmentAmount().catch(() => BigNumber.from(0))
    ]
    return Promise.all(requestArray)
      .then(([totalAsset, minimumInvestmentAmount]) => {
        setTotalAsset(totalAsset)
        setMinimumInvestmentAmount(minimumInvestmentAmount)
        return {
          totalAsset
        }
      })
      .catch(setError)
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
    if (error) {
      setLoading(false)
      setError()
      return
    }
    queryBaseInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  return {
    loading,
    error,
    totalAsset,
    minimumInvestmentAmount,
    fetchUnderlyingUnitsPerShare,
    queryBaseInfo,
    underlyingUnitsPerShare
  }
}

export default useVaultOnRisk
