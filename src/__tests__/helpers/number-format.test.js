import { toFixed, formatBalance, numberSplit } from '@/helpers/number-format'

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

test('number-format formatBalance', () => {
  const text = formatBalance('10000', 2)
  expect(text).toBe('100')
})

test('number-format formatBalance with value undefined', () => {
  const text = formatBalance(undefined, 2)
  expect(text).toBe(undefined)
})

test('number-format formatBalance with value null', () => {
  const text = formatBalance(null, 2)
  expect(text).toBe(undefined)
})

test('number-format formatBalance with decimals undefined', () => {
  const text = formatBalance('10000', undefined)
  expect(text).toBe('10000')
})

test('number-format numberSplit', () => {
  const [text, symbol] = numberSplit(815436538078)
  expect(text).toBe('815.44')
  expect(symbol).toBe('b')
})

test('number-format numberSplit with format', () => {
  const [text, symbol] = numberSplit(815436538078, '0.000000')
  expect(text).toBe('815.436538')
  expect(symbol).toBe('b')
})