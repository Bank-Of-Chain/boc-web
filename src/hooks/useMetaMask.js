import { useEffect, useState, useCallback } from 'react'

// === Utils === //
import map from 'lodash/map'
import noop from 'lodash/noop'
import isEmpty from 'lodash/isEmpty'

const useMetaMask = userProvider => {
  const storageString = sessionStorage.getItem('listenHash')
  const [gasPrice, setGasPrice] = useState(0)
  const [listenHash, setListenHash] = useState(isEmpty(storageString) ? [] : storageString.split(','))
  const [transactions, setTransactions] = useState([])

  /**
   *
   */
  const addListenHash = useCallback(
    hash => {
      if (isEmpty(hash)) return
      const nextListenHash = [hash, ...listenHash]
      sessionStorage.setItem('listenHash', nextListenHash.join(','))
      setListenHash(nextListenHash)
    },
    [listenHash, setListenHash]
  )

  /**
   *
   */
  const removeListenHash = useCallback(
    hash => {
      if (isEmpty(hash)) return
      const nextListenHash = listenHash.filter(i => i !== hash)
      sessionStorage.setItem('listenHash', nextListenHash.join(','))
      setListenHash(nextListenHash)
    },
    [listenHash, setListenHash]
  )

  /**
   *
   */
  const queryGasPrice = useCallback(() => {
    if (!userProvider) {
      return
    }
    userProvider
      .send('eth_gasPrice')
      .then(v => setGasPrice(parseInt(v, 16)))
      .catch(noop)
  }, [userProvider])

  /**
   *
   */
  const queryTransactions = useCallback(() => {
    if (!userProvider) {
      return
    }
    if (isEmpty(listenHash)) {
      setTransactions([])
      return
    }
    Promise.all(
      map(listenHash, item =>
        userProvider.send('eth_getTransactionReceipt', [item]).catch(() => {
          return {
            transactionHash: item
          }
        })
      )
    ).then(setTransactions)
  }, [listenHash, userProvider])

  useEffect(() => {
    queryGasPrice()
    const timer = setInterval(queryGasPrice, 3000)
    return () => clearInterval(timer)
  }, [queryGasPrice])

  useEffect(() => {
    queryTransactions()
    const timer = setInterval(queryTransactions, 3000)
    return () => clearInterval(timer)
  }, [queryTransactions])

  return {
    gasPrice,
    transactions,
    // actions,
    queryGasPrice,
    queryTransactions,
    addListenHash,
    removeListenHash
  }
}

export default useMetaMask
