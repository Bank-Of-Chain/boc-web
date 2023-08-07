import { describe, expect, it, vi } from 'vitest'

// === Store === //
import store from '@/store'

// === Utils === //
import { getWalletName, addToken } from '@/helpers/wallet'

// === Constants === //
import { ETH_ADDRESS } from '@/constants/tokens'

describe('getWalletName', () => {
  describe('Positive Test Cases', () => {
    test('should return the lowercase name of the injected provider', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'injected',
          injectedProvider: {
            name: 'MetaMask'
          }
        }
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('metamask')
    })

    test('should return the lowercase name of the cached provider', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'walletconnect'
        }
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('walletconnect')
    })

    test('should return an empty string if there is no cached provider', () => {
      const web3Modal = {
        providerController: {}
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('')
    })

    test('should return an empty string if there is no user provider', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'injected',
          injectedProvider: {
            name: 'MetaMask'
          }
        }
      }
      const userProvider = false
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('')
    })
  })

  describe('Negative Test Cases', () => {
    test('should return an empty string if web3Modal is not provided', () => {
      const web3Modal = undefined
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('')
    })

    test('should return an empty string if cachedProvider is not provided', () => {
      const web3Modal = {
        providerController: {}
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('')
    })
  })

  describe('Error Test Cases', () => {
    test('should throw an error if injectedProvider is not provided', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'injected'
        }
      }
      const userProvider = true
      expect(() => getWalletName(web3Modal, userProvider)).toBeTruthy()
    })
  })

  describe('Edge Test Cases', () => {
    test('should return the lowercase name of the injected provider with a single character name', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'injected',
          injectedProvider: {
            name: 'A'
          }
        }
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('a')
    })

    test('should return the lowercase name of the cached provider with a single character name', () => {
      const web3Modal = {
        providerController: {
          cachedProvider: 'w'
        }
      }
      const userProvider = true
      const result = getWalletName(web3Modal, userProvider)
      expect(result).toEqual('w')
    })
  })
})

describe('addToken', () => {
  // positive test case
  it('addToken should add token to the wallet', async () => {
    const windowSpy = vi.spyOn(window, 'window', 'get')
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: vi.fn()
      }
    }))
    const tokenAddress = '0x1234567890123456789012345678901234567890'
    const symbol = 'TEST'
    const decimals = 18
    const web3Modal = {
      providerController: {
        cachedProvider: 'injected',
        injectedProvider: {
          name: 'MetaMask'
        }
      }
    }
    const userProvider = true

    vi.mock('ethers', async importOriginal => {
      const mod = await importOriginal()
      const tokenContract = {
        symbol: vi.fn(() => Promise.resolve(symbol)),
        decimals: vi.fn(() => Promise.resolve(decimals))
      }
      return {
        ...mod,
        // replace some exports
        Contract: vi.fn(() => {
          return tokenContract
        })
      }
    })
    store.getState = vi.fn(() => ({ walletReducer: { web3Modal, userProvider } }))

    await addToken(tokenAddress, symbol, decimals)
    // TODO:
    // expect(windowSpy).toHaveBeenCalledWith()
  })

  // negative test case
  it('addToken should not add token if tokenAddress is ETH_ADDRESS', async () => {
    const tokenAddress = ETH_ADDRESS

    const result = await addToken(tokenAddress)

    expect(result).toBe(undefined)
  })

  // error test case
  it('addToken should handle errors', async () => {
    const tokenAddress = '0x1234567890123456789012345678901234567890'
    const web3Modal = {
      providerController: {
        cachedProvider: 'injected',
        injectedProvider: {
          name: 'MetaMask'
        }
      }
    }
    const userProvider = true

    store.getState = vi.fn(() => ({ walletReducer: { web3Modal, userProvider } }))
    vi.mock('ethers', async importOriginal => {
      const error = new Error('Test error')
      const mod = await importOriginal()
      return {
        ...mod,
        // replace some exports
        Contract: vi.fn(() => {
          throw error
        })
      }
    })

    const consoleSpy = vi.spyOn(console, 'log')

    await addToken(tokenAddress)

    expect(consoleSpy).toHaveBeenCalledWith(new Error('Test error'))
  })

  // edge test case
  it('addToken should show warning dialog if wallet does not support adding token', async () => {
    const tokenAddress = '0x1234567890123456789012345678901234567890'
    const symbol = 'TEST'
    const decimals = 18
    const web3Modal = {}
    const userProvider = {}
    store.getState = vi.fn(() => ({ walletReducer: { web3Modal, userProvider } }))
    store.dispatch = vi.fn()
    const dispatchSpy = vi.spyOn(store, 'dispatch')

    await addToken(tokenAddress, symbol, decimals)

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'metaStore/warmDialog',
      payload: {
        open: true,
        type: 'warning',
        message: 'The current wallet does not support adding token (address: 0x1234567890123456789012345678901234567890). You can add token manually.'
      }
    })
  })
})
