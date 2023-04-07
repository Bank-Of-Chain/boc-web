import React, { useState, useCallback, useMemo } from 'react'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Components === //
import EthiVault from './components/Vault/EthiVault'
import UsdiVault from './components/Vault/UsdiVault'
import Loading from '@/components/LoadingComponent'

// === Hooks === //
import useVault from '@/hooks/useVault'
import { useAsync } from 'react-async-hook'
import useErc20Token from '@/hooks/useErc20Token'

// === Services === //
import { getAPY } from '@/services/api-service'

// === Utils === //
import map from 'lodash/map'
import numeral from 'numeral'
import { BigNumber } from 'ethers'
import { toFixed } from '@/helpers/number-format'

// === constants === //
import { ETHI_VAULT, USDI_VAULT_FOR_ETH, ETHI_FOR_ETH, USDI_FOR_ETH, VAULT_BUFFER_FOR_ETHI_ETH, VAULT_BUFFER_FOR_USDI_ETH } from '@/config/config'
import { VAULT_ABI_V2_0 as VAULT_ABI } from '@/constants/abi'

const Pools = props => {
  const { userProvider } = props
  const [openIndex, setOpenIndex] = useState(-1)

  // balances
  const { balance: ethiBalance, decimals: ethiDecimals, loading: ethiBalanceLoading } = useErc20Token(ETHI_FOR_ETH, userProvider)
  const { balance: usdiBalance, decimals: usdiDecimals, loading: usdiBalanceLoading } = useErc20Token(USDI_FOR_ETH, userProvider)

  const {
    balance: vaultBufferEthiBalance,
    decimals: vaultBufferEthiDecimals,
    loading: vaultBufferEthiBalanceLoading
  } = useErc20Token(VAULT_BUFFER_FOR_ETHI_ETH, userProvider)

  const {
    balance: vaultBufferUsdiBalance,
    decimals: vaultBufferUsdiDecimals,
    loading: vaultBufferUsdiBalanceLoading
  } = useErc20Token(VAULT_BUFFER_FOR_USDI_ETH, userProvider)

  // totalAssets
  const { totalAsset: ethiVaultTotalAsset, pegTokenPrice: ethiPrice } = useVault(ETHI_VAULT, VAULT_ABI, userProvider)
  const { totalAsset: usdiVaultTotalAsset, pegTokenPrice: usdiPrice } = useVault(USDI_VAULT_FOR_ETH, VAULT_ABI, userProvider)

  const { result: usdiApy, loading: usdiApyLoading } = useAsync(() =>
    getAPY({ chainId: 1, tokenType: 'USDi' })
      .catch(() => 0)
      .then((data = 0) => 1 * parseFloat(data).toFixed(2))
  )
  const { result: ethiApy, loading: ethiApyLoading } = useAsync(() =>
    getAPY({ chainId: 1, tokenType: 'ETHi' })
      .catch(() => 0)
      .then((data = 0) => 1 * parseFloat(data).toFixed(2))
  )

  const vaultArray = useMemo(() => {
    return [
      {
        icon: (
          <div
            className="w-14 h-8 inline-grid"
            style={{
              gridTemplateColumns: 'repeat(2, auto)'
            }}
          >
            <img className="w-8 h-8" src="/images/0xdAC17F958D2ee523a2206206994597C13D831ec7.png" />
            <img className="w-8 h-8 -ml-1" src="/images/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" />
            <img
              className="w-8 h-8 -mt-2"
              style={{ justifySelf: 'center', gridColumn: 'span 2 / auto' }}
              src="/images/0x6B175474E89094C44Da98b954EedeAC495271d0F.png"
            />
          </div>
        ),
        name: 'Usd Vault',
        apy: <Loading loading={usdiApyLoading}>{usdiApy}%</Loading>,
        tvl: `${numeral(toFixed(usdiVaultTotalAsset, BigNumber.from(10).pow(18), 2)).format('0,0.[00]')} USD`,
        depositAmount: (
          <span>
            <Loading loading={usdiBalanceLoading}>
              {numeral(toFixed(usdiBalance.mul(usdiPrice), BigNumber.from(10).pow(36), 2)).format('0,0.[00]')}
            </Loading>
            {vaultBufferUsdiBalance.gt(0) && (
              <span>
                <span className="mx-1">+</span>
                <Loading loading={vaultBufferUsdiBalanceLoading}>
                  {numeral(toFixed(vaultBufferUsdiBalance.mul(usdiPrice), BigNumber.from(10).pow(36), 2)).format('0,0.[00]')}
                </Loading>
                <span className="color-fuchsia-700 mx-1">(pending)</span>
              </span>
            )}
            USD
          </span>
        ),
        txComponents: <UsdiVault />
      },
      {
        icon: <img className="w-12 b-rd-6" src="/images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png" />,
        name: 'Eth Vault',
        apy: <Loading loading={ethiApyLoading}>{ethiApy}%</Loading>,
        tvl: `${numeral(toFixed(ethiVaultTotalAsset, BigNumber.from(10).pow(18), 4)).format('0,0.[0000]')} ETH`,
        depositAmount: (
          <span>
            <Loading loading={ethiBalanceLoading}>
              {numeral(toFixed(ethiBalance.mul(ethiPrice), BigNumber.from(10).pow(36), 2)).format('0,0.[00]')}
            </Loading>
            {vaultBufferEthiBalance.gt(0) && (
              <span>
                <span className="mx-1">+</span>
                <Loading loading={vaultBufferEthiBalanceLoading}>
                  {numeral(toFixed(vaultBufferEthiBalance.mul(ethiPrice), BigNumber.from(10).pow(36), 2)).format('0,0.[00]')}
                </Loading>
                <span className="color-fuchsia-700 mx-1">(pending)</span>
              </span>
            )}
            ETH
          </span>
        ),
        txComponents: <EthiVault />
      }
    ]
  }, [
    usdiApy,
    usdiApyLoading,
    ethiApy,
    ethiApyLoading,
    ethiVaultTotalAsset,
    usdiVaultTotalAsset,
    ethiBalance,
    ethiBalanceLoading,
    usdiBalance,
    usdiBalanceLoading,
    vaultBufferEthiBalance,
    vaultBufferEthiBalanceLoading,
    vaultBufferUsdiBalance,
    vaultBufferUsdiBalanceLoading,
    ethiDecimals,
    usdiDecimals,
    vaultBufferEthiDecimals,
    vaultBufferUsdiDecimals,
    ethiPrice,
    usdiPrice
  ])

  /**
   *
   */
  const handleOpenClick = useCallback(
    index => {
      setOpenIndex(index === openIndex ? -1 : index)
    },
    [openIndex]
  )

  return (
    <div className="max-w-6xl color-white pt-13 px-20 pb-0 mt-24 mx-auto">
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer style={{ width: '100%' }} className="b-1 border-rd-4 py-4 px-8 bg-dark-500 leh-3 text-center shadow-xl shadow-dark-900">
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">Vault</span>
            </GridItem>
            <GridItem xs={2} sm={2} md={2}>
              <span className="color-neutral-500">
                APY<span className="text-3 ml-2">(Last 7 Days)</span>
              </span>
            </GridItem>
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">TVL</span>
            </GridItem>
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">My Deposits</span>
            </GridItem>
            <GridItem xs={1} sm={1} md={1}></GridItem>
          </GridContainer>
          {map(vaultArray, (vault, index) => {
            const { icon, name, apy, tvl, depositAmount, txComponents } = vault
            return (
              <GridContainer key={index}>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer
                    style={{ width: '100%' }}
                    className="b-1 border-rd-4 py-4 px-8 bg-dark-500 mt-4 leh-3 text-center shadow-xl shadow-dark-900 cursor-pointer"
                    onClick={() => handleOpenClick(index)}
                  >
                    <GridItem xs={3} sm={3} md={3} className="flex justify-center">
                      {icon}
                      <span className="ml-4">{name}</span>
                    </GridItem>
                    <GridItem xs={2} sm={2} md={2}>
                      <span className="color-fuchsia-700">{apy}</span>
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                      {tvl}
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                      {depositAmount}
                    </GridItem>
                    <GridItem xs={1} sm={1} md={1}>
                      <div className={openIndex === index ? 'i-ep-arrow-up-bold' : 'i-ep-arrow-down-bold'}></div>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                {openIndex === index && (
                  <GridItem xs={12} sm={12} md={12}>
                    {txComponents}
                  </GridItem>
                )}
              </GridContainer>
            )
          })}
        </GridItem>
      </GridContainer>
    </div>
  )
}

export default Pools
