import { useState, useEffect } from 'react'

const useUserAddress = provider => {
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    const getUserAddress = async injectedProvider => {
      const signer = injectedProvider.getSigner()
      if (signer) setUserAddress(await signer.getAddress())
    }

    if (provider) getUserAddress(provider)
  }, [provider])

  return userAddress
}

export default useUserAddress
