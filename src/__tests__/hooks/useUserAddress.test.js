import { renderHook } from '@testing-library/react-hooks'
import useUserAddress from '@/hooks/useUserAddress'
import { mockProvider } from './../jest'

test('useUserAddress hooks Render', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useUserAddress(mockProvider()))
  await waitForNextUpdate()
  expect(result.current).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
})
