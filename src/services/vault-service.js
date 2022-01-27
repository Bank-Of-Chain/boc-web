// === Constants === //
import {
  VAULT_ABI,
  STRATEGY_ABI,
  IERC20_ABI
} from './../constants'

// === Utils === //
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import * as ethers from "ethers";
/**
 * 获取vault下的策略地址列表
 * @param {string} vaultAddress 
 */
export const getStrategiesAddress = async (vaultAddress, userProvider) => {
  if (isEmpty(vaultAddress)) return []
  const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, userProvider);
  const strategiesAddress = await vaultContract.getStrategies().catch(console.error);
  return strategiesAddress;
}

/**
 * 获取策略详情数据
 * @param {*} strategiesAddress 
 * @returns 
 */
export const getStrategiesDetailsByAddress = async (vaultAddress, strategiesAddress = [], userProvider) => {
  const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, userProvider);
  const nextData = await Promise.all(map(strategiesAddress, async (item) => {
    const contract = new ethers.Contract(item, STRATEGY_ABI, userProvider);
    const wantAddress = await contract.getWants();
    return await Promise.all([
      contract.name(),
      vaultContract.strategies(item),
      contract.estimatedDepositedAssets().then(rs => rs.toString()),
      contract.estimatedTotalAssets().then(rs => rs.toString()),
      Promise.all(map(wantAddress, async (wantItem) => {
        const wantItemContract = new ethers.Contract(wantItem, IERC20_ABI, userProvider);
        return {
          name: await wantItemContract.symbol(),
          amount: await wantItemContract.balanceOf(item).then(rs => rs.toString())
        }
      })),
    ]).then(([
      name, vaultState, estimatedDepositedAssets, estimatedTotalAssets, balanceOfWant
    ]) => {
      const {
        activation,
        enforceChangeLimit,
        lastReport,
        totalDebt,
        totalGain,
        totalLoss
      } = vaultState
      return {
        key: item,
        name: name,
        address: item,
        enforceChangeLimit,
        activation: activation.toString(),
        totalDebt: totalDebt.toString(),
        totalGain: totalGain.toString(),
        totalLoss: totalLoss.toString(),
        lastReport: lastReport.toString(),
        estimatedDepositedAssets,
        balanceOfWant,
        estimatedTotalAssets
      };
    }).catch(console.error);
  }));
  return nextData
}