import useApyFetch from '@/hooks/useApyFetch'
import { renderHook } from '@testing-library/react-hooks'
import { describe, expect, it } from 'vitest'

describe('useApyFetch testcases', () => {
  it('the useApyFetch hooks should be render correct', async () => {
    const { result, waitFor } = renderHook(() => useApyFetch(1))

    expect(result.current.loading).toBeTruthy()

    await waitFor(() => result.current.loading === false, { timeout: 5000 })

    expect(result.current.usdi.length).toBe(6)
    expect(result.current.ethi.length).toBe(6)
  })
})
