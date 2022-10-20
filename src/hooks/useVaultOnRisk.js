import { useState, useEffect } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import isEmpty from 'lodash/isEmpty'

// === Hooks === //
import useUserAddress from './useUserAddress'

// === Constants === //
import { IERC20_ABI } from '@/constants'

const { Contract, BigNumber } = ethers

const useVaultOnRisk = (VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, VAULT_ADDRESS, VAULT_ABI, UNISWAPV3_RISK_ON_HELPER, userProvider) => {
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)
  const [baseInfo, setBaseInfo] = useState({})

  const address = useUserAddress(userProvider)

  const valid = () => {
    if (isEmpty(VAULT_ADDRESS)) return new Error('VAULT_ADDRESS is need!')
    if (isEmpty(VAULT_ABI)) return new Error('VAULT_ABI is need!')
    if (isEmpty(userProvider)) return new Error('userProvider is need!')
  }

  /**
   * query vault base info
   * @returns
   */
  const queryBaseInfo = () => {
    const error = valid()
    if (error) return setError(error)
    setLoading(true)
    const vaultFactoryContract = new Contract(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, userProvider)
    vaultFactoryContract.uniswapV3RiskOnHelper().then(helperAddress => {
      const contract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const helperContract = new Contract(helperAddress, UNISWAPV3_RISK_ON_HELPER, userProvider)
      return Promise.all([
        contract.borrowToken().then(async i => {
          const tokenContract = new Contract(i, IERC20_ABI, userProvider)
          return { borrowToken: i, name: await tokenContract.symbol(), borrowTokenDecimals: BigNumber.from(10).pow(await tokenContract.decimals()) }
        }),
        contract.wantToken().then(async i => {
          const tokenContract = new Contract(i, IERC20_ABI, userProvider)
          return { wantToken: i, name: await tokenContract.symbol(), wantTokenDecimals: BigNumber.from(10).pow(await tokenContract.decimals()) }
        })
      ])
        .then(([borrowInfo, wantInfo]) => {
          const { borrowToken } = borrowInfo
          const { wantToken } = wantInfo
          return Promise.all([
            contract.netMarketMakingAmount(),
            helperContract.getCurrentBorrow(borrowToken, 2, VAULT_ADDRESS),
            helperContract.getTotalCollateralTokenAmount(VAULT_ADDRESS, wantToken),
            contract.depositTo3rdPoolTotalAssets(),
            contract.estimatedTotalAssets()
          ]).then(([netMarketMakingAmount, currentBorrow, totalCollateralTokenAmount, depositTo3rdPoolTotalAssets, estimatedTotalAssets]) => {
            return helperContract.calcCanonicalAssetValue(borrowToken, currentBorrow, wantToken).then(currentBorrowWithCanonical => {
              const nextBaseInfo = {
                netMarketMakingAmount,
                currentBorrow,
                currentBorrowWithCanonical,
                depositTo3rdPoolTotalAssets,
                totalCollateralTokenAmount,
                estimatedTotalAssets,
                wantInfo,
                borrowInfo,
                result: depositTo3rdPoolTotalAssets.add(totalCollateralTokenAmount).sub(netMarketMakingAmount).sub(currentBorrowWithCanonical)
              }
              setBaseInfo(nextBaseInfo)
              return nextBaseInfo
            })
          })
        })
        .finally(() => {
          setTimeout(() => {
            setLoading(false)
          }, 300)
        })
    })
  }

  useEffect(() => {
    const error = valid()
    if (error) {
      setLoading(false)
      setError()
      return
    }
    queryBaseInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider])

  return {
    loading,
    error,
    baseInfo,
    queryBaseInfo
  }
}

export default useVaultOnRisk
