import { toFixed, formatBalance } from '@/helpers/number-format'

test('number-format toFixed', () => {
  const text = toFixed('10000', '100')
  expect(text).toBe('100')
})

test('number-format toFixed with value undefined', () => {
  const text = toFixed(undefined, '100')
  expect(text).toBe(undefined)
})

test('number-format toFixed with value null', () => {
  const text = toFixed(null, '100')
  expect(text).toBe(undefined)
})

test('number-format toFixed with decimals undefined', () => {
  const text = toFixed('10000', undefined)
  expect(text).toBe('10000')
})

test('number-format toFixed with decimals null', () => {
  const text = toFixed('10000', null)
  expect(text).toBe('10000')
})

test('number-format toFixed with decimals isZero', () => {
  const text = toFixed('10000', 0)
  expect(text).toBe('0')
})

test('number-format toFixed formatBalance', () => {
  const text = formatBalance('10000', 2)
  expect(text).toBe('100')
})
