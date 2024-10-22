import { renderHook, act } from '@testing-library/react-hooks'
import useLocalStorage from '@/hooks/useLocalStorage'

test('useLocalStorage hooks Render', () => {
  const key = 'test'
  const initialValue = 'test text'
  const nextValue = initialValue + ' update'
  const { result } = renderHook(() => useLocalStorage(key, initialValue))

  act(() => {
    result.current[1](nextValue)
  })

  expect(result.current[0]).toBe(nextValue)
})
