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
  return errorMsg.endsWith("'is distributing'")
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

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isNotAllowedLeverageFactor = (errorMsg = '') => {
  return errorMsg.endsWith("'NotAllowedLeverageFactor()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isNotAllowedWhenNotExpirableException = (errorMsg = '') => {
  return errorMsg.endsWith("'NotAllowedWhenNotExpirableException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isNotAllowedInWhitelistedMode = (errorMsg = '') => {
  return errorMsg.endsWith("'NotAllowedInWhitelistedMode()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isAccountTransferNotAllowedException = (errorMsg = '') => {
  return errorMsg.endsWith("'AccountTransferNotAllowedException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isCantLiquidateWithSuchHealthFactorException = (errorMsg = '') => {
  return errorMsg.endsWith("'CantLiquidateWithSuchHealthFactorException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isCantLiquidateNonExpiredException = (errorMsg = '') => {
  return errorMsg.endsWith("'CantLiquidateNonExpiredException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isIncorrectCallDataException = (errorMsg = '') => {
  return errorMsg.endsWith("'IncorrectCallDataException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isForbiddenDuringClosureException = (errorMsg = '') => {
  return errorMsg.endsWith("'ForbiddenDuringClosureException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isIncreaseAndDecreaseForbiddenInOneCallException = (errorMsg = '') => {
  return errorMsg.endsWith("'IncreaseAndDecreaseForbiddenInOneCallException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isUnknownMethodException = (errorMsg = '') => {
  return errorMsg.endsWith("'UnknownMethodException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isIncreaseDebtForbiddenException = (errorMsg = '') => {
  return errorMsg.endsWith("'IncreaseDebtForbiddenException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isCantTransferLiquidatableAccountException = (errorMsg = '') => {
  return errorMsg.endsWith("'CantTransferLiquidatableAccountException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isBorrowedBlockLimitException = (errorMsg = '') => {
  return errorMsg.endsWith("'BorrowedBlockLimitException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isBorrowAmountOutOfLimitsException = (errorMsg = '') => {
  return errorMsg.endsWith("'BorrowAmountOutOfLimitsException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isBalanceLessThanMinimumDesiredException = (errorMsg = '') => {
  return errorMsg.endsWith("'BalanceLessThanMinimumDesiredException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isOpenAccountNotAllowedAfterExpirationException = (errorMsg = '') => {
  return errorMsg.endsWith("'OpenAccountNotAllowedAfterExpirationException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isExpectedBalancesAlreadySetException = (errorMsg = '') => {
  return errorMsg.endsWith("'ExpectedBalancesAlreadySetException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isActionProhibitedWithForbiddenTokensException = (errorMsg = '') => {
  return errorMsg.endsWith("'ActionProhibitedWithForbiddenTokensException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isCantWithdrawException = (errorMsg = '') => {
  return errorMsg.endsWith("'CantWithdrawException()'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isBorrowNotEnough = (errorMsg = '') => {
  return errorMsg.endsWith("'5'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolConnectedCreditManagersOnly = (errorMsg = '') => {
  return errorMsg.endsWith("'LP0'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolIncompatibleCreditAccountManager = (errorMsg = '') => {
  return errorMsg.endsWith("'LP1'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolMoreThanExpectedLiquidityLimit = (errorMsg = '') => {
  return errorMsg.endsWith("'LP2'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolReserveInsufficient = (errorMsg = '') => {
  return errorMsg.endsWith("'LP3'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolIncorrectWithdrawFee = (errorMsg = '') => {
  return errorMsg.endsWith("'LP4'")
}

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isPoolCantAddCreditManagerTwice = (errorMsg = '') => {
  return errorMsg.endsWith("'LP5'")
}
