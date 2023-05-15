import { errorTextOutput, isEs, isAd } from '@/helpers/error-handler'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('isAd logic correctly', () => {
    const errorMsg = "xxxxxx'AD'"
    const flag = isAd(errorMsg)
    expect(flag).toBeTruthy()
  })

  it('isEs logic correctly', () => {
    const errorMsg = "xxxxxx'ES'"
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
      error: {
        data: {
          message: text
        }
      }
    }
    const flag = errorTextOutput(error)
    expect(flag).toBe(text)
  })
})
