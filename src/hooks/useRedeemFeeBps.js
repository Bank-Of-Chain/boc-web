import { useState, useEffect } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

const { Contract, BigNumber } = ethers

const useRedeemFeeBps = props => {
  const { userProvider, VAULT_ADDRESS, VAULT_ABI } = props
  const [value, setValue] = useState(BigNumber.from(0))
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const reload = () => {
    setLoading(true)
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    vaultContract
      .redeemFeeBps()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS)) {
      setLoading(false)
      setError()
      return
    }
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProvider, VAULT_ADDRESS])

  return {
    value,
    loading,
    error,
    reload
  }
}

export default useRedeemFeeBps
