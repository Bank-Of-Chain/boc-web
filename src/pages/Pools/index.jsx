import React, { useState, useCallback, useMemo, useEffect } from 'react'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Components === //
import EthiVault from './components/Vault/EthiVault'
import UsdiVault from './components/Vault/UsdiVault'
import Loading from '@/components/LoadingComponent'

// === Hooks === //
import { useAtom } from 'jotai'
import useVault from '@/hooks/useVault'
import { useAsync } from 'react-async-hook'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'

// === Services === //
import { getAPY } from '@/services/api-service'

// === Stores === //
import { penddingTxAtom } from '@/jotai'

// === Utils === //
import map from 'lodash/map'
import numeral from 'numeral'
import isEmpty from 'lodash/isEmpty'
import { BigNumber, providers } from 'ethers'
import { toFixed } from '@/helpers/number-format'

// === constants === //
import { RPC_URL } from '@/constants'
import { VAULT_ABI_V2_0 as VAULT_ABI } from '@/constants/abi'
import { ETHI_VAULT, USDI_VAULT_FOR_ETH, ETHI_FOR_ETH, USDI_FOR_ETH, VAULT_BUFFER_FOR_ETHI_ETH, VAULT_BUFFER_FOR_USDI_ETH } from '@/config/config'

const Pools = props => {
  const { userProvider } = props
  const address = useUserAddress(userProvider)
  const [openIndex, setOpenIndex] = useState(-1)

  const [penddingTx] = useAtom(penddingTxAtom)
  console.log('penddingTx=', penddingTx)

  // balances
  const {
    balance: ethiBalance,
    decimals: ethiDecimals,
    loading: ethiBalanceLoading,
    queryBalance: ethiQueryBalance,
    tokenContract: ethiTokenContract
  } = useErc20Token(ETHI_FOR_ETH, userProvider)
  const {
    balance: usdiBalance,
    decimals: usdiDecimals,
    loading: usdiBalanceLoading,
    queryBalance: usdiQueryBalance,
    tokenContract: usdiTokenContract
  } = useErc20Token(USDI_FOR_ETH, userProvider)

  const {
    balance: vaultBufferEthiBalance,
    decimals: vaultBufferEthiDecimals,
    loading: vaultBufferEthiBalanceLoading,
    queryBalance: vaultBufferEthiQueryBalance,
    totalSupply: vaultBufferEthiTotalSupply
  } = useErc20Token(VAULT_BUFFER_FOR_ETHI_ETH, userProvider)

  const {
    balance: vaultBufferUsdiBalance,
    decimals: vaultBufferUsdiDecimals,
    loading: vaultBufferUsdiBalanceLoading,
    queryBalance: vaultBufferUsdiQueryBalance,
    totalSupply: vaultBufferUsdiTotalSupply
  } = useErc20Token(VAULT_BUFFER_FOR_USDI_ETH, userProvider)

  const provider = useMemo(() => new providers.StaticJsonRpcProvider(RPC_URL[1], 1), [RPC_URL])
  // totalAssets
  const {
    totalAssetsIncludeVaultBuffer: ethiTotalAssetsIncludeVaultBuffer,
    queryTotalAssetsIncludeVaultBuffer: queryEthiTotalAssetsIncludeVaultBuffer,
    isTotalAssetLoading: isEthiTotalAssetLoading,
    pegTokenPrice: ethiPrice,
    totalValueInVaultBuffer: ethiTotalValueInVaultBuffer,
    queryTotalValueInVaultBuffer: queryEthiTotalValueInVaultBuffer
  } = useVault(ETHI_VAULT, VAULT_ABI, userProvider || provider)

  const {
    totalAssetsIncludeVaultBuffer: usdiTotalAssetsIncludeVaultBuffer,
    queryTotalAssetsIncludeVaultBuffer: queryUsdiTotalAssetsIncludeVaultBuffer,
    isTotalAssetLoading: isUsdiTotalAssetLoading,
    pegTokenPrice: usdiPrice,
    totalValueInVaultBuffer: usdiTotalValueInVaultBuffer,
    queryTotalValueInVaultBuffer: queryUsdiTotalValueInVaultBuffer
  } = useVault(USDI_VAULT_FOR_ETH, VAULT_ABI, userProvider || provider)

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

  const ethiPegTokenTicketPrice = useMemo(() => {
    const priceDecimals = BigNumber.from(10).pow(18)
    if (vaultBufferEthiTotalSupply.isZero()) {
      return priceDecimals
    }
    return ethiTotalValueInVaultBuffer.mul(priceDecimals).div(vaultBufferEthiTotalSupply)
  }, [ethiTotalValueInVaultBuffer, vaultBufferEthiTotalSupply])

  const usdiPegTokenTicketPrice = useMemo(() => {
    const priceDecimals = BigNumber.from(10).pow(18)
    if (vaultBufferUsdiTotalSupply.isZero()) {
      return priceDecimals
    }
    return usdiTotalValueInVaultBuffer.mul(priceDecimals).div(vaultBufferUsdiTotalSupply)
  }, [usdiTotalValueInVaultBuffer, vaultBufferUsdiTotalSupply])

  const vaultArray = useMemo(() => {
    const style = {
      backgroundImage: 'linear-gradient(223.3deg,#a68efd 20.71%,#f4acf3 103.56%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }
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
        apy: (
          <Loading className="vertical-middle" loading={usdiApyLoading}>
            {usdiApy}%
          </Loading>
        ),
        tvl: (
          <Loading className="vertical-middle" loading={isUsdiTotalAssetLoading}>
            {numeral(toFixed(usdiTotalAssetsIncludeVaultBuffer, BigNumber.from(10).pow(18), 2)).format('0,0.[00]')}
            <span className="ml-1" style={style}>
              USD
            </span>
          </Loading>
        ),
        depositAmount: (
          <span>
            <Loading className="vertical-middle" loading={usdiBalanceLoading}>
              {numeral(toFixed(usdiBalance.mul(usdiPrice), BigNumber.from(10).pow(36), 2)).format('0,0.[00]')}
            </Loading>
            {vaultBufferUsdiBalance.gt(0) && (
              <span>
                <span className="mx-1">+</span>
                <Loading className="vertical-middle" loading={vaultBufferUsdiBalanceLoading}>
                  {numeral(
                    toFixed(vaultBufferUsdiBalance.mul(usdiPegTokenTicketPrice), BigNumber.from(10).pow(vaultBufferUsdiDecimals + ethiDecimals), 2)
                  ).format('0,0.[00]')}
                </Loading>
                <span className="color-fuchsia-700 mx-1">(pending)</span>
              </span>
            )}
            <span className="ml-1" style={style}>
              USD
            </span>
          </span>
        ),
        txComponents: (
          <UsdiVault
            reload={() => {
              usdiQueryBalance()
              vaultBufferUsdiQueryBalance()
              queryUsdiTotalValueInVaultBuffer()
              queryUsdiTotalAssetsIncludeVaultBuffer()
            }}
          />
        )
      },
      {
        icon: <img className="w-12 b-rd-6" src="/images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png" />,
        name: 'Eth Vault',
        apy: (
          <Loading className="vertical-middle" loading={ethiApyLoading}>
            {ethiApy}%
          </Loading>
        ),
        tvl: (
          <Loading className="vertical-middle" loading={isEthiTotalAssetLoading}>
            {numeral(toFixed(ethiTotalAssetsIncludeVaultBuffer, BigNumber.from(10).pow(18), 4)).format('0,0.[0000]')}
            <span className="ml-1" style={style}>
              ETH
            </span>
          </Loading>
        ),
        depositAmount: (
          <span>
            <Loading className="vertical-middle" loading={ethiBalanceLoading}>
              {numeral(toFixed(ethiBalance.mul(ethiPrice), BigNumber.from(10).pow(36), 4)).format('0,0.[0000]')}
            </Loading>
            {vaultBufferEthiBalance.gt(0) && (
              <span>
                <span className="mx-1">+</span>
                <Loading className="vertical-middle" loading={vaultBufferEthiBalanceLoading}>
                  {numeral(
                    toFixed(vaultBufferEthiBalance.mul(ethiPegTokenTicketPrice), BigNumber.from(10).pow(vaultBufferEthiDecimals + ethiDecimals), 4)
                  ).format('0,0.[0000]')}
                </Loading>
                <span className="color-fuchsia-700 mx-1">(pending)</span>
              </span>
            )}
            <span className="ml-1" style={style}>
              ETH
            </span>
          </span>
        ),
        txComponents: (
          <EthiVault
            reload={() => {
              ethiQueryBalance()
              vaultBufferEthiQueryBalance()
              queryEthiTotalValueInVaultBuffer()
              queryEthiTotalAssetsIncludeVaultBuffer()
            }}
          />
        )
      }
    ]
  }, [
    usdiApy,
    usdiApyLoading,
    ethiApy,
    ethiApyLoading,
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
    usdiPrice,
    vaultBufferEthiTotalSupply,
    vaultBufferUsdiTotalSupply,
    ethiTotalAssetsIncludeVaultBuffer,
    usdiTotalAssetsIncludeVaultBuffer,
    queryEthiTotalAssetsIncludeVaultBuffer,
    queryUsdiTotalAssetsIncludeVaultBuffer,
    ethiPegTokenTicketPrice,
    usdiPegTokenTicketPrice
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

  useEffect(() => {
    if (isEmpty(address) || isEmpty(ethiTokenContract)) return
    ethiTokenContract.on('Transfer', queryEthiTotalAssetsIncludeVaultBuffer)
    return () => {
      ethiTokenContract.off('Transfer', queryEthiTotalAssetsIncludeVaultBuffer)
    }
  }, [ethiTokenContract, queryEthiTotalAssetsIncludeVaultBuffer, address])

  useEffect(() => {
    if (isEmpty(address) || isEmpty(usdiTokenContract)) return
    usdiTokenContract.on('Transfer', queryUsdiTotalAssetsIncludeVaultBuffer)
    return () => {
      usdiTokenContract.off('Transfer', queryUsdiTotalAssetsIncludeVaultBuffer)
    }
  }, [usdiTokenContract, queryUsdiTotalAssetsIncludeVaultBuffer, address])

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
                <GridItem xs={12} sm={12} md={12} className={openIndex === index ? '' : 'hidden'}>
                  {txComponents}
                </GridItem>
              </GridContainer>
            )
          })}
        </GridItem>
      </GridContainer>
    </div>
  )
}

export default Pools
