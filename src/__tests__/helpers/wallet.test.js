import { describe, expect, it, vi, beforeAll } from 'vitest'

// === Mocks === //
import { mockProvider } from './../jest'

// === Utils === //
import { getWalletName, addToken } from '@/helpers/wallet'

// === Constants === //
import { USDT_ADDRESS, ETH_ADDRESS } from '@/constants/tokens'

describe('wallet runs correct', () => {
  let windowSpy

  beforeAll(() => {
    windowSpy = vi.spyOn(window, 'window', 'get')
  })

  afterEach(() => {
    windowSpy.mockRestore()
  })

  it('getWalletName with undefined provider', () => {
    expect(getWalletName()).toBe('')
  })

  it('getWalletName with null provider', () => {
    expect(getWalletName(null, null)).toBe('')
  })

  it('getWalletName runs correct', () => {
    expect(getWalletName({}, mockProvider())).toBe('')
  })

  it('addToken runs correct', () => {
    expect(addToken()).toBeTruthy()
  })

  it('addToken runs correct', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: vi.fn()
      }
    }))
    expect(addToken(USDT_ADDRESS, 'USDT', 6)).toBeTruthy()
  })

  it('ETH will add failed', () => {
    expect(addToken(ETH_ADDRESS, 'ETH', 18)).toBeTruthy()
  })
})
