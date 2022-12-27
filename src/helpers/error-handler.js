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
  return errorMsg.endsWith("'AD'")
}

/**
 * emergency shutdown
 * @param {*} errorMsg
 * @returns
 */
export const isEs = (errorMsg = '') => {
  return errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")
}

/**
 * rebase pause
 * @param {*} errorMsg
 * @returns
 */
export const isRp = (errorMsg = '') => {
  return errorMsg.endsWith("'RP'")
}

/**
 * redeemFeeBps invalid
 * @param {*} errorMsg
 * @returns
 */
export const isRi = (errorMsg = '') => {
  return errorMsg.endsWith("'RI'")
}

/**
 * amount invalid
 * @param {*} errorMsg
 * @returns
 */
export const isAi = (errorMsg = '') => {
  return errorMsg.endsWith("'AI'")
}

/**
 * received less than minimum
 * @param {*} errorMsg
 * @returns
 */
export const isRLTM = (errorMsg = '') => {
  return errorMsg.endsWith("'RLTM'")
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
  return errorMsg.indexOf('loss much') !== -1 || errorMsg.indexOf('amount lower than minimum') !== -1
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
  return errorMsg.endsWith("'ID'")
}

/**
 * less then minimum
 * @param {*} errorMsg
 * @returns
 */
export const isLessThanMinValue = (errorMsg = '') => {
  return errorMsg.endsWith("'Amount must be gt minimum Investment Amount'")
}

/**
 * transfer not enough
 * @param {*} errorMsg
 * @returns
 */
export const isTransferNotEnough = (errorMsg = '') => {
  return errorMsg.endsWith("'ERC20: transfer amount exceeds allowance'")
}
