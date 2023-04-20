import React, { useState, useCallback, useEffect } from 'react'
import classnames from 'classnames'

// === Components === //
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import LinearProgress from '@material-ui/core/LinearProgress'

// === Hooks === //
import { useAtom } from 'jotai'
import useWallet from '@/hooks/useWallet'
import useMetaMask from '@/hooks/useMetaMask'

// === Stores === //
import { penddingTxAtom } from '@/jotai'

// === Utils === //
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import { short } from '@/helpers/string-utils'
import { toFixed } from '@/helpers/number-format'
import { BigNumber } from 'ethers'
import numeral from 'numeral'

// === Constants === //
// import { ZERO_ADDRESS } from '@/constants/tokens'
import { CHAIN_BROWSER_URL } from '@/constants'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'

// if tx is pendding, we get tx data every 300ms
const DEFAULT_DURATION = 300

// if tx is done, we no need to get tx data too frequent
const TX_DONE_DURATION = 60 * 60 * 1000

// after MAX_FETCHING_TIMES fetching, if transactionReceipt is null, we will close the SnackBarCard
const MAX_FETCHING_TIMES = 1000

const SnackBarCard = props => {
  const { tx, hash, close, text, closeDurationDefault = 10, children } = props

  const [penddingTx, setPenddingTx] = useAtom(penddingTxAtom)
  const { userProvider } = useWallet()
  const [replaceHash, setReplaceHash] = useState()
  const [cancelHash, setCancelHash] = useState()
  const [isIgnore, setIsIgnore] = useState(false)
  const [duration, setDuration] = useState(DEFAULT_DURATION)
  const [closeDuration, setCloseDuration] = useState(-1)
  const [fetchingTime, setFetchingTime] = useState(MAX_FETCHING_TIMES)
  const [transactionReceipt, setTransactionReceipt] = useState()
  const [, setIsTransactionReceiptLoading] = useState(true)

  const [openDetails, setOpenDetails] = useState(false)

  const { gasPrice, sendTransaction, queryTransaction, queryTransactionReceipt } = useMetaMask(userProvider)

  const isEmptyTx = isEmpty(transactionReceipt)

  /**
   *
   */
  const queryTransactionReceiptCall = useCallback(
    targetHash => {
      if (isEmpty(targetHash)) return
      setIsTransactionReceiptLoading(true)
      queryTransactionReceipt(targetHash)
        .catch(() => undefined)
        .then(v => {
          if (!isEmpty(v)) {
            const nextPenddingTx = filter(penddingTx, item => item !== hash && item !== replaceHash && item !== cancelHash)
            setPenddingTx(nextPenddingTx)
          }
          return setTransactionReceipt(v)
        })
        .finally(() => {
          setIsTransactionReceiptLoading(false)
          setFetchingTime(fetchingTime - 1)
        })
    },
    [fetchingTime, penddingTx, replaceHash, cancelHash, hash]
  )

  /**
   *
   */
  const speedUp = useCallback(async () => {
    //TODO:
    console.error('can not speed up the tx with txid or hash currently!')
  }, [userProvider, hash])

  /**
   *
   */
  const txCancel = useCallback(async () => {
    //TODO:
    console.error('can not cancel the tx with txid or hash currently!')
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

  /**
   *
   */
  const closeHandle = useCallback(() => {
    setIsIgnore(true)
  })

  useEffect(() => {
    if (isEmpty(transactionReceipt)) return
    if (transactionReceipt.status === '0x1' || transactionReceipt.status === '0x0') {
      setDuration(TX_DONE_DURATION)
      setCloseDuration(closeDurationDefault)
    }
  }, [transactionReceipt, closeDurationDefault])

  useEffect(() => {
    const interval = setInterval(() => {
      queryTransactionReceiptCall(cancelHash || replaceHash || hash)
    }, duration)
    return () => clearInterval(interval)
  }, [hash, cancelHash, replaceHash, duration, queryTransactionReceiptCall])

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
          setCancelHash(replacement.hash)
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
      className={classnames('w-72 p-4 b-rd-1 shadow-xl shadow-dark-500 bg-truegray-900', {
        hidden: isIgnore
      })}
    >
      <span onClick={closeHandle} className="i-ep-circle-close-filled absolute -right-2 -top-2 cursor-pointer text-6 hover:bg-red-400"></span>
      {isEmptyTx && (
        <div className="flex justify-center items-center font-bold b-b-1 b-color-stone-400 b-solid mb-4 mt-2 p-1 color-purple-700">
          <span className="i-ic-outline-schedule-send mr-1"></span>Pending...
        </div>
      )}
      {transactionReceipt?.status === '0x1' && (
        <div className="flex justify-center items-center font-bold b-b-1 b-color-stone-400 b-solid b-color mb-4 mt-2 p-1 color-green-700">
          <span className="i-ic-sharp-check color-green-500 mr-1"></span>
          {isEmpty(cancelHash) ? 'Success!' : 'Cancel!'}
        </div>
      )}
      {transactionReceipt?.status === '0x0' && (
        <div className="flex justify-center items-center font-bold b-b-1 b-color-stone-400 b-solid b-color mb-4 mt-2 p-1 color-red-700">
          <span className="i-ic-sharp-close color-red-500 mr-1"></span>
          Failed!
        </div>
      )}
      {isEmpty(replaceHash) && isEmpty(cancelHash) && (
        <div className="flex justify-between mb-2">
          <span>
            <span className="color-stone-400">Hash</span>
            <span className="ml-1 mr-2">:</span>
            <span className="color-lightblue-500 cursor-pointer">{short(hash)}</span>
          </span>
          <span onClick={() => window.open(`${CHAIN_BROWSER_URL}/tx/${hash}`)} className="cursor-pointer i-ic-baseline-launch ml-2 text-5"></span>
        </div>
      )}
      {!isEmpty(replaceHash) && (
        <div className="flex justify-between mb-2">
          <span>
            <span className="color-stone-400">Hash</span>
            <span className="ml-1 mr-2">:</span>
            <span className="color-lightblue-500 cursor-pointer">{short(replaceHash)}</span>
          </span>
          <span
            onClick={() => window.open(`${CHAIN_BROWSER_URL}/tx/${replaceHash}`)}
            className="cursor-pointer i-ic-baseline-launch ml-2 text-5"
          ></span>
        </div>
      )}
      {!isEmpty(cancelHash) && (
        <div className="flex justify-between mb-2">
          <span>
            <span className="color-stone-400">Hash</span>
            <span className="ml-1 mr-2">:</span>
            <span className="color-lightblue-500 cursor-pointer">{short(cancelHash)}</span>
          </span>
          <span
            onClick={() => window.open(`${CHAIN_BROWSER_URL}/tx/${cancelHash}`)}
            className="cursor-pointer i-ic-baseline-launch ml-2 text-5"
          ></span>
        </div>
      )}
      <div className="flex justify-between" style={{ display: 'none' }}>
        <span>
          Current Price<span className="ml-1 mr-2">:</span>
          <span>{numeral(toFixed(BigNumber.from(gasPrice), BigNumber.from(10).pow(9))).format('0,0')} Gwei</span>
        </span>
      </div>
      <div className="flex justify-start items-center">
        <span className="flex flex-wrap">
          <span className="color-stone-400">Action</span>
          <span className="ml-1 mr-2">:</span>
          {text}
        </span>
        {!isEmpty(children) && (
          <span
            onClick={() => setOpenDetails(!openDetails)}
            className={classnames('cursor-pointer ml-2 mb-2', {
              'i-ic-sharp-keyboard-double-arrow-down': !openDetails,
              'i-ic-sharp-keyboard-double-arrow-up': openDetails
            })}
          />
        )}
      </div>
      {openDetails && children}
      {!isEmptyTx && (
        <div className="mb-2">
          <span className="color-stone-400">Gas Used</span>
          <span className="ml-1 mr-2">:</span>
          <span>
            {toFixed(
              BigNumber.from(transactionReceipt.gasUsed).mul(BigNumber.from(transactionReceipt.effectiveGasPrice)),
              BigNumber.from(10).pow(18),
              9
            )}
            &nbsp;ETH
          </span>
        </div>
      )}
      {isEmptyTx && (
        <div className="block my-4">
          <Box display="flex" alignItems="center">
            <Box width="100%">
              <LinearProgress
                classes={{
                  barColorPrimary: '!bg-lightblue-500'
                }}
              />
            </Box>
          </Box>
        </div>
      )}
      <div className="flex justify-center">
        {isEmptyTx && (
          <Tooltip placement="top" title={'The tx will be speed up in 1.5x gasprice'}>
            <span className="cursor-pointer bg-green-500 color-white px-2 py-1 b-rd-1 flex items-center mr-2 !hidden" onClick={speedUp}>
              <span>Speed Up</span>
              <span className="i-mdi-alert-circle ml-1" />
            </span>
          </Tooltip>
        )}
        {isEmptyTx && (
          <Tooltip placement="top" title={'The tx will be cancelled in 1.5x gasprice'}>
            <span className="cursor-pointer bg-red-500 color-white px-2 py-1 b-rd-1 flex items-center mr-2 !hidden" onClick={txCancel}>
              <span>Cancel</span>
              <span className="i-mdi-alert-circle ml-1" />
            </span>
          </Tooltip>
        )}
        <span className="cursor-pointer bg-stone-400 color-white px-2 py-1 b-rd-1 " onClick={closeHandle}>
          Ignore {closeDuration > 0 && `(${closeDuration}s)`}
        </span>
      </div>
    </div>
  )
}

export default SnackBarCard
