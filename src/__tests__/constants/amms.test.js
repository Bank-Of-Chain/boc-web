import { PLATFORM_HOME_URL, STRATEGIES } from '@/constants/amms'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  STRATEGIES.map(i => {
    it(`${i} has platform link`, () => {
      expect(PLATFORM_HOME_URL[i]).toBeTruthy()
    })
  })
})
