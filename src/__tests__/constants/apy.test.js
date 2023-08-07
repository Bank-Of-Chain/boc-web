import { usdiArray, ethiArray, apyType } from '@/constants/apy'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it(`usdiArray has 5 array item`, () => {
    expect(usdiArray.length).toBe(5)
  })

  it(`ethiArray has 5 array item`, () => {
    expect(ethiArray.length).toBe(5)
  })

  it(`every item must have apy type`, () => {
    for (const item of usdiArray) {
      expect(apyType[item]).toBeTruthy()
    }

    for (const item of ethiArray) {
      expect(apyType[item]).toBeTruthy()
    }
  })
})
