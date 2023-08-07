import { isValid } from '@/helpers/number'
import { BigNumber } from 'ethers'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('isValid test', () => {
    const text = isValid('10000', 2)
    expect(text).toBeTruthy()
  })

  it('isValid test undefined', () => {
    const text = isValid(undefined, 2)
    expect(text).toBeFalsy()
  })

  it('isValid test undefined', () => {
    const text = isValid(null, 2)
    expect(text).toBe(undefined)
  })

  it('not a integer', () => {
    const text = isValid('10.001', 2)
    expect(text).toBeFalsy()
  })

  it('less than lower', () => {
    const text = isValid('100.01', 2, BigNumber.from(10).pow(4))
    expect(text).toBeFalsy()
  })

  it('with a Negative number', () => {
    const text = isValid('-10000', 2)
    expect(text).toBeFalsy()
  })

  it('with a letter string', () => {
    const text = isValid('abc', 2)
    expect(text).toBeFalsy()
  })
})
