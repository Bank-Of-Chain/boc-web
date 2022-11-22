import { usdiArray, ethiArray, apyType } from '@/constants/apy'

test(`usdiArray has 6 array item`, () => {
  expect(usdiArray.length).toBe(6)
})

test(`ethiArray has 6 array item`, () => {
  expect(ethiArray.length).toBe(6)
})

test(`every item must have apy type`, () => {
  for (const item of usdiArray) {
    expect(apyType[item]).toBeTruthy()
  }

  for (const item of ethiArray) {
    expect(apyType[item]).toBeTruthy()
  }
})
