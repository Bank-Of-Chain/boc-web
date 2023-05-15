import { getProtocolsFromBestRouter, getProtocolsFromBestRouterFor1inchV4, getProtocolsFromBestRouterForParaswap } from '@/helpers/swap-util'
import { describe, expect, it } from 'vitest'

const paraswapData = {
  name: 'paraswap',
  platform: '0x11111112542D85B3EF69AE05771c2dCCff4fAa26',
  method: 5,
  encodeExchangeArgs: '',
  slippage: 10,
  oracleAdditionalSlippage: 20,
  toTokenAmount: '9989142489',
  bestRoute: [
    {
      percent: 100,
      swaps: [
        {
          srcToken: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          srcDecimals: 6,
          destToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          destDecimals: 6,
          swapExchanges: [
            {
              exchange: 'BalancerV2',
              srcAmount: '10000000000',
              destAmount: '9999141631',
              percent: 100,
              poolAddresses: ['0x06df3b2bbb68adc8b0e302443692037ed9f91b42'],
              data: {
                swaps: [
                  {
                    poolId: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
                    amount: '10000000000'
                  }
                ],
                gasUSD: '2.953962'
              }
            }
          ]
        }
      ]
    }
  ]
}

const oneInchData = {
  name: 'oneInchV4',
  platform: '0x1111111254fb6c44bAC0beD2854e76F90643097d',
  method: 0,
  encodeExchangeArgs:
    '0xe449022e00000000000000000000000000000000000000000000000000000002540be400000000000000000000000000000000000000000000000000000000025366681a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000018000000000000000000000003416cf6c708da44db2624d63ea0aaef7113527c6cfee7c08',
  slippage: 10,
  oracleAdditionalSlippage: 20,
  toTokenAmount: '9989154842',
  bestRoute: [
    [
      [
        {
          name: 'UNISWAP_V3',
          part: 100,
          fromTokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
        }
      ]
    ]
  ]
}

describe('xxxxxxxx', () => {
  it('getProtocolsFromBestRouter for paraswapData', () => {
    const array = getProtocolsFromBestRouter(paraswapData)
    expect(array).toEqual(['BalancerV2'])
  })

  it('getProtocolsFromBestRouter for oneInchData', () => {
    const array = getProtocolsFromBestRouter(oneInchData)
    expect(array).toEqual(['UNISWAP_V3'])
  })

  it('getProtocolsFromBestRouter for null', () => {
    const array = getProtocolsFromBestRouter(null)
    expect(array).toEqual([])
  })

  it('getProtocolsFromBestRouter for undefined', () => {
    const array = getProtocolsFromBestRouter(undefined)
    expect(array).toEqual([])
  })

  it('getProtocolsFromBestRouter for string type', () => {
    const array = getProtocolsFromBestRouter('123')
    expect(array).toEqual([])
  })

  it('getProtocolsFromBestRouter for number type', () => {
    const array = getProtocolsFromBestRouter(123)
    expect(array).toEqual([])
  })

  it('getProtocolsFromBestRouter for error platform', () => {
    try {
      getProtocolsFromBestRouter({
        ...paraswapData,
        name: 'gogogo'
      })
    } catch (error) {
      expect(error.message).toBe('not support')
    }
  })

  it('getProtocolsFromBestRouterFor1inchV4 for oneInchData', () => {
    const array = getProtocolsFromBestRouterFor1inchV4(oneInchData.bestRoute)
    expect(array).toEqual(['UNISWAP_V3'])
  })

  it('getProtocolsFromBestRouterForParaswap for paraswapData', () => {
    const array = getProtocolsFromBestRouterForParaswap(paraswapData.bestRoute)
    expect(array).toEqual(['BalancerV2'])
  })
})
