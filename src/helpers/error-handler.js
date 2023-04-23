/**
 * analysis text in error
 * @param {*} error
 * @returns
 */
export const errorTextOutput = error => {
  let errorMsg = error.toString()
  if (error?.reason) {
    errorMsg = error.reason
  }
  if (error?.message) {
    errorMsg = error.message
  }
  if (error?.data?.message) {
    errorMsg = error.data.message
  }
  if (error?.error?.data?.originalError?.message) {
    errorMsg = error.error.data.originalError.message
  }
  if (error?.error?.data?.message) {
    errorMsg = error.error.data.message
  }
  return errorMsg
}

/**
 * adjustment
 * @param {*} errorMsg
 * @returns
 */
export const isAd = (errorMsg = '') => {
  return errorMsg.includes("'AD'") || errorMsg.includes('"AD"') || errorMsg === 'AD'
}

/**
 * emergency shutdown
 * @param {*} errorMsg
 * @returns
 */
export const isEs = (errorMsg = '') => {
  return errorMsg.includes("'ES or AD'") || errorMsg.includes("'ES'") || errorMsg.includes('"ES"') || errorMsg === 'ES'
}

/**
 * rebase pause
 * @param {*} errorMsg
 * @returns
 */
export const isRp = (errorMsg = '') => {
  return errorMsg.includes("'RP'") || errorMsg.includes('"RP"') || errorMsg === 'RP'
}

/**
 * exchange error slippage not enough
 * @param {*} errorMsg
 * @returns
 */
export const isLossMuch = (errorMsg = '') => {
  return (
    errorMsg.endsWith("'Return amount is not enough'") ||
    errorMsg.endsWith("'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(Min return not reached)'") ||
    errorMsg.endsWith("'callBytes failed: Error(Received amount of tokens are less then expected)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(Return amount is not enough)'") ||
    errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
    errorMsg.endsWith("Error: VM Exception while processing transaction: reverted with reason string 'OL'") ||
    errorMsg.endsWith("'paraswap callBytes failed: Error(UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(IIA)'") ||
    errorMsg.endsWith("'paraswap callBytes failed: Error(Received amount of tokens are less then expected)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(UNIV3R: min return)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(LOP: bad signature)'")
  )
}

/**
 * withdraw error
 * @param {*} errorMsg
 * @returns
 */
export const isMaxLoss = (errorMsg = '') => {
  return errorMsg.includes('loss much') || errorMsg.includes('amount lower than minimum')
}

/**
 * exchange error in fork chain
 * @param {*} errorMsg
 * @returns
 */
export const isExchangeFail = (errorMsg = '') => {
  return errorMsg.endsWith('callBytes failed: Error(Call to adapter failed)')
}

/**
 * distributing
 * @param {*} errorMsg
 * @returns
 */
export const isDistributing = (errorMsg = '') => {
  return errorMsg.includes("'is distributing'") || errorMsg.includes('"is distributing"')
}

/**
 * less then minimum
 * @param {*} errorMsg
 * @returns
 */
export const isLessThanMinValue = (errorMsg = '') => {
  return errorMsg.includes("'Amount must be gt minimum Investment Amount'") || errorMsg.includes('"Amount must be gt minimum Investment Amount"')
}

/**
 * transfer not enough
 * @param {*} errorMsg
 * @returns
 */
export const isTransferNotEnough = (errorMsg = '') => {
  return errorMsg.includes("'ERC20: transfer amount exceeds allowance'") || errorMsg.includes('"ERC20: transfer amount exceeds allowance"')
}

/**
 * adjustment
 * @param {*} errorMsg
 * @returns
 */
export const isRLTM = (errorMsg = '') => {
  return errorMsg.includes('RLTM')
}

/**
 * //Investment less than minimum
 * @param {*} errorMsg
 * @returns
 */
export const isILTM = (errorMsg = '') => {
  return errorMsg.includes('ILTM')
}
