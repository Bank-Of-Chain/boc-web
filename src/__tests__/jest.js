test('', () => {})
export const mockProvider = (address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') => {
  const mock = jest.fn().mockReturnValue({
    getSigner: () => {
      return {
        getAddress: () => {
          return address
        }
      }
    }
  })
  return mock()
}

export const mockProviderWithSigner = () => {
  const mock = jest.fn().mockReturnValue({
    getSigner: () => {
      return {
        getAddress: () => {
          return ''
        }
      }
    }
  })
  return mock()
}
