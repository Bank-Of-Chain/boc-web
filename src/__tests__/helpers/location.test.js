import { isMarketingHost, dashboardHost } from '@/helpers/location'
import { describe, expect, it, beforeAll, vi } from 'vitest'

describe('location runs correctly', () => {
  let windowSpy

  beforeAll(() => {
    windowSpy = vi.spyOn(window, 'window', 'get')
  })

  afterEach(() => {
    windowSpy.mockRestore()
  })

  it('"bankofchain.io" isMarketingHost', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        host: 'bankofchain.io'
      }
    }))
    expect(isMarketingHost()).toBeTruthy()
  })

  it('"web.bankofchain.io" isMarketingHost', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        host: 'web.bankofchain.io'
      }
    }))
    expect(isMarketingHost()).toBeTruthy()
  })

  it('"www.baidu.com" is not isMarketingHost', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        host: 'www.baidu.com'
      }
    }))
    expect(isMarketingHost()).toBeFalsy()
  })

  it('marketing host generator dashboard host correct', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        host: 'bankofchain.io'
      }
    }))
    expect(dashboardHost(1, 'usdi')).toBe('https://dashboard.bankofchain.io/#/?chain=1&vault=usdi')
  })

  it('"www.baidu.com" will generator dashboard host correct', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        host: 'www.baidu.com'
      }
    }))
    expect(dashboardHost(1, 'usdi')).toBe('https://dashboard-v2.bankofchain.io/#/?chain=1&vault=usdi')
  })
})
