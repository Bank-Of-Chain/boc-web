import { useState, useEffect, useCallback } from 'react'

// === Utils === //
import isEmpty from 'lodash-es/isEmpty'

/**
 *
 * @param {*} provider
 * @returns
 */
const useUserAddress = provider => {
  const [userAddress, setUserAddress] = useState('')

  /**
   *
   */
  const queryUserAddress = useCallback(() => {
    const signer = provider?.getSigner()
    if (isEmpty(provider) || isEmpty(signer)) {
      setUserAddress('')
      return
    }
    signer
      .getAddress()
      .then(setUserAddress)
      .catch(() => setUserAddress(''))
  }, [provider])

  useEffect(queryUserAddress, [queryUserAddress])

  return userAddress
}

export default useUserAddress
