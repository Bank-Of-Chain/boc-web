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
        contract.wantToken().then(async wantToken => {
          const tokenContract = new Contract(wantToken, IERC20_ABI, userProvider)
          const token0 = await contract.token0()
          const token1 = await contract.token1()
          let minLendFunction
          if (token0 === wantToken) {
            minLendFunction = contract.token0MinLendAmount
          } else if (token1 === wantToken) {
            minLendFunction = contract.token1MinLendAmount
          }
          return {
            wantToken,
            name: await tokenContract.symbol(),
            wantTokenDecimals: BigNumber.from(10).pow(await tokenContract.decimals()),
            minLendFunction
          }
        })
      ])
        .then(([borrowInfo, wantInfo]) => {
          const { borrowToken } = borrowInfo
          const { wantToken, minLendFunction } = wantInfo
          return Promise.all([
            contract.netMarketMakingAmount(),
            helperContract.getCurrentBorrow(borrowToken, 2, VAULT_ADDRESS),
            helperContract.getTotalCollateralTokenAmount(VAULT_ADDRESS, wantToken),
            contract.depositTo3rdPoolTotalAssets(),
            contract.estimatedTotalAssets(),
            contract.manageFeeBps(),
            minLendFunction()
          ]).then(
            ([
              netMarketMakingAmount,
              currentBorrow,
              totalCollateralTokenAmount,
              depositTo3rdPoolTotalAssets,
              estimatedTotalAssets,
              manageFeeBps,
              minInvestment
            ]) => {
              return helperContract.calcCanonicalAssetValue(borrowToken, currentBorrow, wantToken).then(currentBorrowWithCanonical => {
                const nextBaseInfo = {
                  netMarketMakingAmount,
                  currentBorrow,
                  currentBorrowWithCanonical,
                  depositTo3rdPoolTotalAssets,
                  totalCollateralTokenAmount,
                  estimatedTotalAssets,
                  manageFeeBps,
                  wantInfo,
                  borrowInfo,
                  result: depositTo3rdPoolTotalAssets.add(totalCollateralTokenAmount).sub(netMarketMakingAmount).sub(currentBorrowWithCanonical),
                  minInvestment
                }
                setBaseInfo(nextBaseInfo)
                return nextBaseInfo
              })
            }
          )
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
