import { getDefiRate, getProfits, getHomePageData } from '@/services/api-service'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import axios from 'axios'

// === Constants === //
import { BOC_SERVER } from '@/constants'

describe('getHomePageData', () => {
  let axiosGetSpy
  beforeEach(() => {
    axiosGetSpy = vi.spyOn(axios, 'get')
  })

  afterEach(() => {
    axiosGetSpy.mockRestore()
  })

  // Positive test case
  test('should return home page data', async () => {
    const mockData = { data: 'mock home page data' }
    axiosGetSpy.mockResolvedValueOnce(mockData)
    const result = await getHomePageData()
    expect(result).toEqual(mockData.data)
    expect(axiosGetSpy).toHaveBeenCalledWith(`${BOC_SERVER}/home-page`)
  })

  // Negative test case
  test('should return null when axios.get returns null', async () => {
    axiosGetSpy.mockResolvedValueOnce(null)
    const result = await getHomePageData()
    expect(result).toBeUndefined()
    expect(axiosGetSpy).toHaveBeenCalledWith(`${BOC_SERVER}/home-page`)
  })

  // Error test case
  test('should throw an error when axios.get throws an error', async () => {
    const mockError = new Error('mock error')
    axiosGetSpy.mockRejectedValueOnce(mockError)
    await expect(getHomePageData()).rejects.toThrow(mockError)
    expect(axiosGetSpy).toHaveBeenCalledWith(`${BOC_SERVER}/home-page`)
  })

  // Edge test case
  test('should return empty string when axios.get returns empty string', async () => {
    axiosGetSpy.mockResolvedValueOnce('')
    const result = await getHomePageData()
    expect(result).toBeUndefined()
    expect(axiosGetSpy).toHaveBeenCalledWith(`${BOC_SERVER}/home-page`)
  })
})
