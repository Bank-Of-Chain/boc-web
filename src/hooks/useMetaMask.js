import { useEffect, useState, useCallback } from 'react'

// === Utils === //
import noop from 'lodash/noop'
import isEmpty from 'lodash/isEmpty'

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
      .then(v => {
        const gasPriceValue = parseInt(v, 16)
        if (gasPriceValue !== gasPrice) {
          setGasPrice(gasPriceValue)
        }
      })
      .catch(noop)
      .finally(() => {
        setGasPriceLoading(false)
      })
  }, [userProvider, gasPrice])

  /**
   *
   */
  const queryTransactionReceipt = useCallback(
    txHash => {
      if (isEmpty(userProvider) || isEmpty(txHash)) {
        return
      }
      return userProvider.send('eth_getTransactionReceipt', [txHash]).catch(() => {
        return {
          txHash
        }
      })
    },
    [userProvider]
  )

  /**
   *
   */
  const queryTransaction = useCallback(
    txHash => {
      if (isEmpty(userProvider) || isEmpty(txHash)) {
        return
      }
      return userProvider.send('eth_getTransactionByHash', [txHash]).catch(() => {
        return {
          txHash
        }
      })
    },
    [userProvider]
  )

  /**
   *
   */
  const sendTransaction = useCallback(
    tx => {
      if (isEmpty(userProvider) || isEmpty(tx)) {
        return
      }
      return userProvider.send('eth_sendTransaction', [tx]).catch(() => undefined)
    },
    [userProvider]
  )

  useEffect(() => {
    queryGasPrice()
    const timer = setInterval(queryGasPrice, 30000)
    return () => clearInterval(timer)
  }, [queryGasPrice])

  return {
    gasPrice,
    gasPriceLoading,
    // actions,
    queryGasPrice,
    sendTransaction,
    queryTransaction,
    queryTransactionReceipt
  }
}

export default useMetaMask
