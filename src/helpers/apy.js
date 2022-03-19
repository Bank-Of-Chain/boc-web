export const calVaultAPY = (vaultDailyData) => {
  let beginPricePerShare = 1;
  let beginTime = 0;
  for (let i = 0; i < vaultDailyData.length; i++) {
    if (vaultDailyData[i].totalShares) {
      beginPricePerShare = Number(vaultDailyData[i].unlockedPricePerShare);
      beginTime = Number(vaultDailyData[i].id);
      break;
    }
  }
  let endPricePerShare = 1;
  let endTime = 0;
  for (let i = vaultDailyData.length - 1; i > 0; i--) {
    if (vaultDailyData[i].unlockedPricePerShare) {
      endPricePerShare = Number(vaultDailyData[i].unlockedPricePerShare);
      endTime = Number(vaultDailyData[i].id);
      break;
    }
  }

  return calAPY(beginPricePerShare, endPricePerShare, endTime - beginTime);
}

const calAPY = (beginPricePerShare, endPricePerShare, timeDiffSenconds) => {
  return Math.pow(1 + Number(endPricePerShare - beginPricePerShare) / Number(beginPricePerShare), 365 * 24 * 60 * 60 / timeDiffSenconds) - 1;
}

export const calVaultDailyAPY = (vaultDailyData) => {
  let lastPricePerShare = undefined;
  let lastTime = undefined;
  for (let i = 0; i < vaultDailyData.length; i++) {
    if (vaultDailyData[i].totalShares) {

      const currentPricePerShare = Number(vaultDailyData[i].tvl / vaultDailyData[i].totalShares);
      const currentBeginTime = Number(vaultDailyData[i].id);
      if (lastPricePerShare) {
        vaultDailyData[i].apy = calAPY(lastPricePerShare, currentPricePerShare, currentBeginTime - lastTime);
      }
      if(vaultDailyData[i].apy > 10){
        console.warn('apy more than 1000%',JSON.stringify(vaultDailyData[i]));
        vaultDailyData[i].apy =null;
      }
      lastPricePerShare = currentPricePerShare;
      lastTime = currentBeginTime;
    }
  }
  return vaultDailyData;
}
