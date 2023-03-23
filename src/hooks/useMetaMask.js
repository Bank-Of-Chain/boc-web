import { useEffect, useState, useCallback } from 'react'

// === Utils === //
import noop from 'lodash/noop'

const useMetaMask = userProvider => {
  const [gasPrice, setGasPrice] = useState(0)
  const [gasPriceLoading, setGasPriceLoading] = useState(false)

  /**
   *
   */
  const queryGasPrice = useCallback(() => {
    if (!userProvider) {
      return
    }
    setGasPriceLoading(true)
    userProvider
      .send('eth_gasPrice')
      .then(v => setGasPrice(parseInt(v, 16)))
      .catch(noop)
      .finally(() => {
        setTimeout(() => {
          setGasPriceLoading(false)
        }, 800)
      })
  }, [userProvider])

  useEffect(() => {
    queryGasPrice()
    const timer = setInterval(queryGasPrice, 5000)
    return () => clearInterval(timer)
  }, [queryGasPrice])

  return {
    gasPrice,
    gasPriceLoading,
    // actions,
    queryGasPrice
  }
}

export default useMetaMask
