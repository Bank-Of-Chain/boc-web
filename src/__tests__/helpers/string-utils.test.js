import { short } from '@/helpers/string-utils'
import { describe, expect, it } from 'vitest'

describe('string-utils runs correct', () => {
  it('short runs correct', () => {
    expect(short('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe('0xf39F...2266')
  })
  it('short null  runs correct', () => {
    expect(short(null)).toBe('')
  })
  it('short undefined  runs correct', () => {
    expect(short(undefined)).toBe('')
  })
})
