import { usdiArray, ethiArray, apyType } from '@/constants/apy'

test(`usdiArray has 5 array item`, () => {
  expect(usdiArray.length).toBe(5)
})

test(`ethiArray has 5 array item`, () => {
  expect(ethiArray.length).toBe(5)
})

test(`every item must have apy type`, () => {
  for (const item of usdiArray) {
    expect(apyType[item]).toBeTruthy()
  }

  for (const item of ethiArray) {
    expect(apyType[item]).toBeTruthy()
  }
})
