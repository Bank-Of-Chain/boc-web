/**
 * 解析出error中的错误文本信息
 * @param {*} error
 * @returns
 */
export const errorTextOutput = (error) => {
  let errorMsg = error.toString();
  if (error?.message) {
    errorMsg = error.message;
  }
  if (error?.data?.message) {
    errorMsg = error.data.message;
  }
  if (error?.error?.data?.originalError?.message) {
    errorMsg = error.error.data.originalError.message;
  }
  if (error?.error?.data?.message) {
    errorMsg = error.error.data.message;
  }
  return errorMsg;
};

/**
 * 正在adjustment状态
 * @param {*} errorMsg
 * @returns
 */
export const isAd = (errorMsg = "") => {
  return errorMsg.endsWith("'AD'");
};

/**
 * 正在ermery shutdown状态
 * @param {*} errorMsg
 * @returns
 */
export const isEs = (errorMsg = "") => {
  return errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'");
};

/**
 *
 * @param {*} errorMsg
 * @returns
 */
export const isRp = (errorMsg = "") => {
  return errorMsg.endsWith("'RP'");
};

/**
 * 兑换异常
 * 针对那种，设置了过低的兑换异常，多试几次都没有用的，只有通过提高slipper来使兑换通过
 * @param {*} errorMsg
 * @returns
 */
export const isLossMuch = (errorMsg = "") => {
  return (
    errorMsg.endsWith("'Return amount is not enough'") ||
    errorMsg.endsWith(
      "'callBytes failed: Error(Uniswap: INSUFFICIENT_OUTPUT_AMOUNT)'"
    ) ||
    errorMsg.endsWith(
      "'1inch V4 swap failed: Error(Min return not reached)'"
    ) ||
    errorMsg.endsWith(
      "'callBytes failed: Error(Received amount of tokens are less then expected)'"
    ) ||
    errorMsg.endsWith(
      "'1inch V4 swap failed: Error(Return amount is not enough)'"
    ) ||
    errorMsg.endsWith("'Received amount of tokens are less then expected'") ||
    errorMsg.endsWith(
      "Error: VM Exception while processing transaction: reverted with reason string 'OL'"
    ) ||
    errorMsg.endsWith(
      "'paraswap callBytes failed: Error(UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT)'"
    ) ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(IIA)'") ||
    errorMsg.endsWith(
      "'paraswap callBytes failed: Error(Received amount of tokens are less then expected)'"
    ) ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(UNIV3R: min return)'") ||
    errorMsg.endsWith("'1inch V4 swap failed: Error(LOP: bad signature)'")
  );
};

/**
 * 取款异常
 * 针对那种maxloss设置过低，导致取款失败的问题
 * @param {*} errorMsg
 * @returns
 */
export const isMaxLoss = (errorMsg = "") => {
  return (
    errorMsg.indexOf("loss much") !== -1 ||
    errorMsg.indexOf("amount lower than minimum") !== -1
  );
};

/**
 * 兑换异常
 * 针对那种，线上查询成功，fork链上兑换，兑换失败的情况，多试试还是能通的
 * @param {*} errorMsg
 * @returns
 */
export const isExchangeFail = (errorMsg = "") => {
  return errorMsg.endsWith("callBytes failed: Error(Call to adapter failed)");
};

/**
 * 正在distributing状态
 * @param {*} errorMsg
 * @returns
 */
export const isDistributing = (errorMsg = "") => {
  return errorMsg.endsWith("'is distributing'");
};

/**
 * 小于最小投资额
 * @param {*} errorMsg
 * @returns
 */
export const isLessThanMinValue = (errorMsg = "") => {
  return errorMsg.endsWith("'Amount must be gt minimum Investment Amount'");
};
