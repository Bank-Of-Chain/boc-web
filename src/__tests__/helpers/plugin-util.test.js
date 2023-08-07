import { hasMetamaskInstalled, hasWalletInstalled, isMobile, isInMobileWalletApp, isInMobileH5 } from '@/helpers/plugin-util'
import { describe, expect, it, vi } from 'vitest'

describe('plugin-util runs correctly', () => {
  let windowSpy

  beforeAll(() => {
    windowSpy = vi.spyOn(window, 'window', 'get')
  })

  afterEach(() => {
    windowSpy.mockRestore()
  })

  it('hasMetamaskInstalled runs correctly', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        connect: () => {}
      }
    }))
    expect(hasMetamaskInstalled()).toBeTruthy()
  })

  it('hasWalletInstalled runs correctly', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        connect: () => {}
      },
      navigator: {
        userAgent: 'ipad'
      }
    }))
    expect(hasWalletInstalled()).toBeTruthy()
  })

  it('isMobile runs correctly', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        connect: () => {}
      },
      navigator: {
        userAgent: 'ipad'
      }
    }))
    expect(isMobile()).toBeTruthy()
  })

  it('isInMobileWalletApp runs correctly', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        connect: () => {}
      },
      navigator: {
        userAgent: 'ipad'
      }
    }))
    expect(isInMobileWalletApp()).toBeTruthy()
  })

  it('isInMobileH5 runs correctly', () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {
        connect: () => {}
      },
      navigator: {
        userAgent: 'ipad'
      }
    }))
    expect(isInMobileH5()).toBeFalsy()
  })
})
