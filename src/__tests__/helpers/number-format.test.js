import { toFixed, formatBalance, customNumeral } from '@/helpers/number-format'

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

const USDI_FORMATTER = 2
const ETHI_FORMATTER = 4
const validBalances = [
  {
    balance: '0',
    usdiExpect: '0',
    ethiExpect: '0'
  },
  {
    balance: '0.01',
    usdiExpect: '0.01',
    ethiExpect: '0.01'
  },
  {
    balance: '0.001',
    usdiExpect: '0',
    ethiExpect: '0.001'
  },
  {
    balance: '0.0001',
    usdiExpect: '0',
    ethiExpect: '0.0001'
  },
  {
    balance: '0.00004',
    usdiExpect: '0',
    ethiExpect: '0'
  },
  {
    balance: '0.00005',
    usdiExpect: '0',
    ethiExpect: '0.0001'
  },
  {
    balance: '0.99998',
    usdiExpect: '1',
    ethiExpect: '1'
  },
  {
    balance: '1',
    usdiExpect: '1',
    ethiExpect: '1'
  },
  {
    balance: '9.99997',
    usdiExpect: '10',
    ethiExpect: '10'
  },
  {
    balance: '10',
    usdiExpect: '10',
    ethiExpect: '10'
  },
  {
    balance: '99.99996',
    usdiExpect: '100',
    ethiExpect: '100'
  },
  {
    balance: '105',
    usdiExpect: '105',
    ethiExpect: '105'
  },
  {
    balance: '999.98994',
    usdiExpect: '999.99',
    ethiExpect: '999.9899'
  },
  {
    balance: '999.99995',
    usdiExpect: '1 k',
    ethiExpect: '1 k'
  },
  {
    balance: '1000',
    usdiExpect: '1 k',
    ethiExpect: '1 k'
  },
  {
    balance: '1564.78652',
    usdiExpect: '1.56 k',
    ethiExpect: '1.5647 k'
  },
  {
    balance: '999999.99991',
    usdiExpect: '1 m',
    ethiExpect: '999.9999 k'
  },
  {
    balance: '999999.99995',
    usdiExpect: '1 m',
    ethiExpect: '999.9999 k'
  },
  {
    balance: '999999999.99995',
    usdiExpect: '1 b',
    ethiExpect: '1 b'
  },
  {
    balance: '999999999999.99995',
    usdiExpect: '1 t',
    ethiExpect: '1 t'
  }
]
for (let i = 0; i < validBalances.length; i++) {
  const { balance, usdiExpect, ethiExpect } = validBalances[i]
  test('number-format customNumeral', () => {
    const usdiFormat = customNumeral(balance, USDI_FORMATTER)
    const ethiFormat = customNumeral(balance, ETHI_FORMATTER)
    console.log(`balance: ${balance}, USDi format: ${usdiFormat}, ETHi format: ${ethiFormat}`)
    expect(usdiFormat.trim()).toBe(usdiExpect)
    expect(ethiFormat.trim()).toBe(ethiExpect)
  })
}
