import * as ethers from "ethers";
import {
  BigNumber
} from 'ethers';

// === Utils === //
import {
  getBestSwapInfo
} from 'piggy-finance-utils';

// === constants === //
import {
  VAULT_ADDRESS,
  VAULT_ABI,
  STRATEGY_ABI,
  IERC20_ABI,
  VALUE_INTERPRETER_ABI,
  EXCHANGE_AGGREGATOR_ABI,
  USDT_ADDRESS
} from "./../constants";

const withdraw = async (vaultAddress, userAddress, shareAmount, userProvider) => {
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, userProvider);
  const usdt = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);

  const valueInterpreterAddress = await vault.valueInterpreter();
  const valueInterpreterConstract = new ethers.Contract(valueInterpreterAddress, VALUE_INTERPRETER_ABI, userProvider);

  const allowAmount = BigNumber.from(await vault.balanceOf(userAddress));

  if (allowAmount.lt(shareAmount)) {
    return new Error("可提取份额不足");
  }

  const usdtBalance = await usdt.balanceOf(vaultAddress);
  const pricePerShare = await vault.pricePerShare();
  // 将份额换算成USDT
  const amount = BigNumber.from(shareAmount).mul(pricePerShare).div(10 ** await usdt.decimals())
  // 如果缓冲池大于提取金额
  const exchangeParams = []
  if (amount.gte(usdtBalance)) {
    const array = await vault.getStrategies();
    const strategies = await Promise.all(array.map(item => vault.strategies(item)));
    // 还差多少钱，需要从策略中退款
    let leftAmount = amount - usdtBalance;
    const exchangePlatformAdapters = await getExchangePlatformAdapters(userProvider);
    for (let i = strategies.length - 1; i >= 0 && leftAmount > 0; i--) {
      const strategyItem = strategies[i];
      const {
        totalDebt
      } = strategyItem;
      // 计算出待提取的金额，策略需要提取部分或全额提取。
      let value = 0;
      if (totalDebt.gte(leftAmount)) {
        value = leftAmount;
      } else {
        value = totalDebt.toString();
      }
      leftAmount -= value;
      // 如果策略所需的币不是usdt的话，需要计算value需要折合成多少策略稳定币。
      const strategyContract = new ethers.Contract(array[i], STRATEGY_ABI, userProvider)
      const want = await strategyContract.want();
      if (value > 0 && want !== USDT_ADDRESS) {
        const strategyTokenAmount = await valueInterpreterConstract.calcCanonicalAssetValue(USDT_ADDRESS, value, want);
        const slipper = 30;

        const wantConstract = new ethers.Contract(want, IERC20_ABI, userProvider);
        const swapInfo = await getBestSwapInfo({
            decimals: (await wantConstract.decimals()).toString(),
            address: want
          }, {
            decimals: (await usdt.decimals()).toString(),
            address: USDT_ADDRESS
          },
          strategyTokenAmount.toString(),
          slipper,
          exchangePlatformAdapters);
        // 两个平台都不行会报错，不用再校验
        exchangeParams.push(swapInfo);
      }
    }
  }
  return exchangeParams;
}

/**
 * 
 * @param {*} userProvider 
 * @returns 
 */
const getExchangePlatformAdapters = async function (userProvider) {
  const exchangeAggregator = await getExchangeAggregator(userProvider);
  const adapters = await exchangeAggregator.getExchangeAdapters();
  const exchangePlatformAdapters = {};
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i];
  }
  return exchangePlatformAdapters;
};

/**
 * 
 * @param {*} userProvider 
 * @returns 
 */
const getExchangeAggregator = async (userProvider) => {
  const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
  const manager = await vault.exchangeManager();
  return new ethers.Contract(manager, EXCHANGE_AGGREGATOR_ABI, userProvider)
}

export {
  withdraw,
  getExchangePlatformAdapters
}