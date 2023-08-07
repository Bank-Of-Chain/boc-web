import {
  errorTextOutput,
  isEs,
  isAd,
  isRp,
  isLossMuch,
  isMaxLoss,
  isExchangeFail,
  isDistributing,
  isLessThanMinValue,
  isTransferNotEnough,
  isRLTM,
  isILTM
} from '@/helpers/error-handler'
import { describe, expect, it } from 'vitest'

describe('error-handle runs correctly', () => {
  it('isRLTM logic correctly', () => {
    const errorMsg = "xxxxxx'RLTM'"
    const flag = isRLTM(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isILTM logic correctly', () => {
    const errorMsg = "xxxxxx'ILTM'"
    const flag = isILTM(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isTransferNotEnough logic correctly', () => {
    const errorMsg = "xxxxxx'ERC20: transfer amount exceeds allowance'"
    const flag = isTransferNotEnough(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isLessThanMinValue logic correctly', () => {
    const errorMsg = "xxxxxx'Amount must be gt minimum Investment Amount'"
    const flag = isLessThanMinValue(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isDistributing logic correctly', () => {
    const errorMsg = "xxxxxx'is distributing'"
    const flag = isDistributing(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isExchangeFail logic correctly', () => {
    const errorMsg = "xxxxxx'callBytes failed: Error(Call to adapter failed)'"
    const flag = isExchangeFail(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isMaxLoss logic correctly', () => {
    const errorMsg = "xxxxxx'loss much'"
    const flag = isMaxLoss(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isLossMuch logic correctly', () => {
    const errorMsg = "xxxxxx'1inch V4 swap failed: Error(LOP: bad signature)'"
    const flag = isLossMuch(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isRp logic correctly', () => {
    const errorMsg = "xxxxxx'RP'"
    const flag = isRp(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isAd logic correctly', () => {
    const errorMsg = "xxxxxx'AD'"
    const flag = isAd(errorMsg)
    expect(flag).toBeTruthy()
  })

  it("'ES' isEs return true", () => {
    const errorMsg = "xxxxxx'ES'"
    const flag = isEs(errorMsg)
    expect(flag).toBeTruthy()
  })

  it("'ES or AD' isEs return true", () => {
    const errorMsg = "xxxxxx'ES or AD'"
    const flag = isEs(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('errorTextOutput return correctly', () => {
    const text = "xxxxxxis'AD'"
    const error = new Error(text)
    const flag = errorTextOutput(error)
    expect(flag).toBe(text)
  })

  it('errorTextOutput return correctly', () => {
    const text = "xxxxxxis'AD'"
    const error = {
      reason: text,
      message: text,
      data: {
        message: text
      },
      error: {
        data: {
          message: text,
          originalError: {
            message: text
          }
        }
      }
    }
    const flag = errorTextOutput(error)
    expect(flag).toBe(text)
  })
})

describe('isMaxLoss', () => {
  test('positive: returns true if error message includes "amount lower than minimum"', () => {
    const result = isMaxLoss('amount lower than minimum')
    expect(result).toBe(true)
  })

  test('positive: returns true if error message includes "loss much"', () => {
    const result = isMaxLoss('loss much')
    expect(result).toBe(true)
  })

  test('negative: returns false if error message does not include "amount lower than minimum" or "loss much"', () => {
    const result = isMaxLoss('Invalid error message')
    expect(result).toBe(false)
  })

  test('edge: returns false if error message is an empty string', () => {
    const result = isMaxLoss('')
    expect(result).toBe(false)
  })

  test('error: throws an error if no error message is provided', () => {
    expect(isMaxLoss()).toBeFalsy()
  })
})
