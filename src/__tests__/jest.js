import { vi } from 'vitest'
export const mockProvider = (address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266') => {
  const mock = vi.fn().mockReturnValue({
    getSigner: () => {
      return {
        getAddress: () => {
          return Promise.resolve(address)
        }
      }
    }
  })
  return mock()
}

export const mockProviderWithSigner = () => {
  const mock = vi.fn().mockReturnValue({
    getSigner: () => {
      return {
        getAddress: () => {
          return Promise.resolve('')
        }
      }
    }
  })
  return mock()
}
