import React, { useState, useCallback, useEffect } from 'react'
import classnames from 'classnames'

// === Components === //
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import LinearProgress from '@material-ui/core/LinearProgress'

// === Hooks === //
import useWallet from '@/hooks/useWallet'
import useMetaMask from '@/hooks/useMetaMask'

// === Utils === //
import get from 'lodash/get'
import toLower from 'lodash/toLower'
import isEmpty from 'lodash/isEmpty'
import { short } from '@/helpers/string-utils'
import { toFixed } from '@/helpers/number-format'
import { BigNumber } from 'ethers'
import numeral from 'numeral'

// === Constants === //
// import { ZERO_ADDRESS } from '@/constants/tokens'
import { ETHI_VAULT, USDI_VAULT_FOR_ETH } from '@/config/config'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'

// if tx is pendding, we get tx data every 300ms
const DEFAULT_DURATION = 300

// if tx is done, we no need to get tx data too frequent
const TX_DONE_DURATION = 60 * 60 * 1000

// after MAX_FETCHING_TIMES fetching, if transactionReceipt is null, we will close the SnackBarCard
const MAX_FETCHING_TIMES = 1000

const VAULT_MAP = {
  [toLower(USDI_VAULT_FOR_ETH)]: 'USDi Vault',
  [toLower(ETHI_VAULT)]: 'ETHi Vault'
}

const SnackBarCard = props => {
  const { tx, hash, close, method } = props
  const { userProvider } = useWallet()
  const [replaceHash, setReplaceHash] = useState()
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [closeDuration, setCloseDuration] = useState(-1)
  const [fetchingTime, setFetchingTime] = useState(MAX_FETCHING_TIMES)
  const [transactionReceipt, setTransactionReceipt] = useState()
  const [, setIsTransactionReceiptLoading] = useState(true)
  const { gasPrice, sendTransaction, queryTransaction, queryTransactionReceipt } = useMetaMask(userProvider)

  const isEmptyTx = isEmpty(transactionReceipt)

  /**
   *
   */
  const queryTransactionReceiptCall = useCallback(
    hash => {
      if (isEmpty(hash)) return
      setIsTransactionReceiptLoading(true)
      queryTransactionReceipt(hash)
        .catch(() => undefined)
        .then(setTransactionReceipt)
        .finally(() => {
          setIsTransactionReceiptLoading(false)
          setFetchingTime(fetchingTime - 1)
        })
    },
    [fetchingTime]
  )

  /**
   *
   */
  const speed = useCallback(async () => {
    //TODO:
    console.error('can not pop up the metamask with txid or hash currently!')
  }, [userProvider, hash])

  /**
   *
   */
  const txCancel = useCallback(async () => {
    // queryTransaction(hash).then(tx => {
    //   const cancelTransation = {
    //     from: tx.from,
    //     nonce: tx.nonce,
    //     to: ZERO_ADDRESS,
    //     data: '0x',
    //     gasPrice: `${Math.ceil(1.5 * tx.gasPrice)}`
    //     // value: tx.value
    //   }
    //   console.log('tx=', tx, 'cancelTransation=', cancelTransation)
    //   sendTransaction(cancelTransation)
    // })
  }, [hash, queryTransaction, sendTransaction])

  useEffect(() => {
    if (isEmpty(transactionReceipt)) return
    if (transactionReceipt.status === '0x1' || transactionReceipt.status === '0x0') {
      setDuration(TX_DONE_DURATION)
      setCloseDuration(10)
    }
  }, [transactionReceipt])

  useEffect(() => {
    const interval = setInterval(() => {
      queryTransactionReceiptCall(replaceHash || hash)
    }, duration)
    return () => clearInterval(interval)
  }, [hash, replaceHash, duration, queryTransactionReceiptCall])

  useEffect(() => {
    if (fetchingTime <= 0) {
      close()
    }
  }, [fetchingTime, close])

  useEffect(() => {
    if (isEmpty(tx)) return
    console.log('start wait', tx)
    tx.wait().catch(error => {
      console.log('inner TRANSACTION_REPLACED=', error)
      const { code, replacement, cancelled } = error
      // if error due to 'TRANSACTION_REPLACED'
      // we should wait the replacement transaction commit before we close the modal
      if (code === TRANSACTION_REPLACED) {
        // if user add gas for tx canceled, return undefined
        if (cancelled) {
          setReplaceHash(replacement.hash)
          return
        }
        setReplaceHash(replacement.hash)
      } else if (code === CALL_EXCEPTION) {
        console.warn('CALL_EXCEPTION')
      }
    })
  }, [tx])

  useEffect(() => {
    if (isEmptyTx || closeDuration < 0) return
    if (closeDuration === 0) {
      close()
      return
    }
    const interval = setInterval(() => {
      setCloseDuration(closeDuration - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isEmptyTx, closeDuration, close])

  return (
    <div
      className={classnames('animate__animated w-72 p-4 b-rd-1 shadow-xl shadow-dark-900', {
        'bg-purple-500': isEmptyTx,
        'bg-green-500 animate__shakeY animate__delay-0.4s': transactionReceipt?.status === '0x1',
        'bg-red-500 animate__shakeX animate__delay-0.4s': transactionReceipt?.status === '0x0'
      })}
    >
      {isEmptyTx && <div className="text-center text-bold b-b-1 b-solid b-color mb-4 mt-2 p-1">Pendding...</div>}
      {transactionReceipt?.status === '0x1' && <div className="text-center text-bold b-b-1 b-solid b-color mb-4 mt-2 p-1">Success!</div>}
      {transactionReceipt?.status === '0x0' && <div className="text-center text-bold b-b-1 b-solid b-color mb-4 mt-2 p-1">Failed!</div>}
      <div className="flex justify-between mb-2">
        <span>
          hash<span className="ml-1 mr-2">:</span>
          <span className="color-lightblue-500 cursor-pointer">{short(hash)}</span>
        </span>
        {isEmpty(replaceHash) && <span className="cursor-pointer i-ic-baseline-launch ml-2 text-5"></span>}
      </div>
      {!isEmpty(replaceHash) && (
        <div className="flex justify-between mb-2">
          <span>
            Replaced By<span className="ml-1 mr-2">:</span>
            <span className="color-lightblue-500 cursor-pointer">{short(replaceHash)}</span>
          </span>
          <span className="cursor-pointer i-ic-baseline-launch ml-2 text-5"></span>
        </div>
      )}
      {!isEmptyTx && (
        <div className="mb-2">
          to<span className="ml-1 mr-2">:</span>
          <span className="color-lightblue-500 cursor-pointer">{get(VAULT_MAP, transactionReceipt.to, short(transactionReceipt.to))}</span>
        </div>
      )}
      <div className="flex justify-between" style={{ display: 'none' }}>
        <span>
          Current Price<span className="ml-1 mr-2">:</span>
          <span>{numeral(toFixed(BigNumber.from(gasPrice), BigNumber.from(10).pow(9))).format('0,0')} Gwei</span>
        </span>
      </div>
      <div className="flex justify-between mb-2">
        <span>
          method<span className="ml-1 mr-2">:</span>
          <span>{method}</span>
        </span>
      </div>
      {!isEmptyTx && (
        <div className="mb-2">
          gas used<span className="ml-1 mr-2">:</span>
          <span>{toFixed(BigNumber.from(parseInt(transactionReceipt.gasUsed, 16)), BigNumber.from(10).pow(9))} ETH</span>
        </div>
      )}
      <div className="block my-2">
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            {isEmptyTx ? (
              <LinearProgress
                classes={{
                  barColorPrimary: '!bg-lightblue-500'
                }}
              />
            ) : (
              <LinearProgress
                classes={{
                  barColorPrimary: '!bg-lightblue-500'
                }}
                variant={'determinate'}
                value={100}
              />
            )}
          </Box>
          <Box minWidth={35} className="text-center">
            <span>{isEmptyTx ? '1/2' : '2/2'}</span>
          </Box>
        </Box>
      </div>
      <div className="flex justify-center">
        {isEmptyTx && (
          <Tooltip placement="top" title={'The tx will be cancelled in 1.5x gasprice'}>
            <span className="cursor-pointer bg-red-500 color-white px-2 py-1 b-rd-1 flex items-center" onClick={txCancel}>
              <span>Cancel</span>
              <span className="i-mdi-alert-circle ml-1" />
            </span>
          </Tooltip>
        )}
        <span className="cursor-pointer bg-sky-500 color-white px-2 py-1 b-rd-1 hidden" onClick={speed}>
          Speed Up
        </span>
        <span className="cursor-pointer bg-stone-400 color-white px-2 py-1 b-rd-1 ml-2" onClick={close}>
          Ignore {closeDuration > 0 && `(${closeDuration}s)`}
        </span>
      </div>
    </div>
  )
}

export default SnackBarCard
