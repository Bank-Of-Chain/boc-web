import { renderHook } from '@testing-library/react-hooks'
import useAbiResolver from '@/hooks/useAbiResolver'
// === Utils === //
import find from 'lodash/find'

test('useAbiResolver hooks Render', () => {
  const { result } = renderHook(() => useAbiResolver('beta-v1.5.9'))
  expect(result.current.VAULT_ABI).toHaveLength(90)
  expect(result.current.VAULT_BUFFER_ABI).toHaveLength(29)
  expect(result.current.PRICE_ORCALE_ABI).toHaveLength(0)
  expect(result.current.EXCHANGE_ADAPTER_ABI).toHaveLength(2)
  expect(result.current.EXCHANGE_AGGREGATOR_ABI).toHaveLength(2)
})

test('useAbiResolver in "ethi" version ', () => {
  const { result } = renderHook(() => useAbiResolver('ethi'))
  expect(result.current.VAULT_ABI).toHaveLength(84)
  expect(result.current.VAULT_BUFFER_ABI).toHaveLength(29)
  expect(result.current.PRICE_ORCALE_ABI).toHaveLength(19)
  expect(result.current.EXCHANGE_ADAPTER_ABI).toHaveLength(2)
  expect(result.current.EXCHANGE_AGGREGATOR_ABI).toHaveLength(2)
  //
})

test('beta-v1.5.9 function correctly', () => {
  const { result } = renderHook(() => useAbiResolver('beta-v1.5.9'))

  // mint function correctly
  const mintAbi = find(result.current.VAULT_ABI, { name: 'mint' })
  expect(mintAbi).toBeTruthy()
  expect(mintAbi.inputs).toHaveLength(3)
  expect(mintAbi.inputs[0].internalType).toBe('address[]')
  expect(mintAbi.inputs[1].internalType).toBe('uint256[]')

  // redeem function correctly
  const redeemAbi = find(result.current.VAULT_ABI, { name: 'redeem' })
  expect(redeemAbi).toBeTruthy()
  expect(redeemAbi.inputs).toHaveLength(2)
  expect(redeemAbi.inputs[0].internalType).toBe('address')
  expect(redeemAbi.inputs[1].internalType).toBe('uint256')
})

test('ethi function correctly', () => {
  const { result } = renderHook(() => useAbiResolver('ethi'))

  // mint function correctly
  const mintAbi = find(result.current.VAULT_ABI, { name: 'mint' })
  expect(mintAbi).toBeTruthy()
  expect(mintAbi.inputs).toHaveLength(3)
  expect(mintAbi.inputs[0].internalType).toBe('address')
  expect(mintAbi.inputs[1].internalType).toBe('uint256')

  // redeem function correctly
  const redeemAbi = find(result.current.VAULT_ABI, { name: 'redeem' })
  expect(redeemAbi).toBeTruthy()
  expect(redeemAbi.inputs).toHaveLength(2)
  expect(redeemAbi.inputs[0].internalType).toBe('address')
  expect(redeemAbi.inputs[1].internalType).toBe('uint256')
})

test('useAbiResolver in "xxxxx" version', () => {
  const { result } = renderHook(() => useAbiResolver('xxxxx'))
  expect(result.current.VAULT_ABI).toHaveLength(0)
  expect(result.current.VAULT_BUFFER_ABI).toHaveLength(0)
  expect(result.current.PRICE_ORCALE_ABI).toHaveLength(0)
  expect(result.current.EXCHANGE_ADAPTER_ABI).toHaveLength(0)
  expect(result.current.EXCHANGE_AGGREGATOR_ABI).toHaveLength(0)
})
