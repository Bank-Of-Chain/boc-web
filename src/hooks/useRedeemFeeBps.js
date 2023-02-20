import { useState, useEffect, useCallback } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

const { Contract, BigNumber } = ethers

const useRedeemFeeBps = props => {
  const { userProvider, VAULT_ADDRESS, VAULT_ABI } = props
  const [value, setValue] = useState(BigNumber.from(0))
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const reload = useCallback(() => {
    if (isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI) || isEmpty(userProvider)) {
      setLoading(false)
      setError()
      return
    }
    setLoading(true)

    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    vaultContract
      .redeemFeeBps()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider])

  useEffect(reload, [reload])

  return {
    value,
    loading,
    error,
    reload
  }
}

export default useRedeemFeeBps
