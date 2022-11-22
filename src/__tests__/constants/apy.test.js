import { array, apyType } from '@/constants/apy'

test(`has 7 array item`, () => {
  expect(array.length).toBe(7)
})

test(`array item must have apy type`, () => {
  for (const item of array) {
    expect(apyType[item]).toBeTruthy()
  }
})
