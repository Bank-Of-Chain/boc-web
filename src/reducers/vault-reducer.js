import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit'

// === Utils === //
import isArray from 'lodash/isArray'

// === Services === //
import {
  getStrategiesAddress,
  getStrategiesDetailsByAddress
} from './../services/vault-service'

export const fetchNotifications = createAsyncThunk(
  'vaultStore/setStrategiesDataDetails',
  async (payload, {
    getState
  }) => {
    const {
      address,
      userProvider
    } = payload
    const strategies = await getStrategiesAddress(address, userProvider)
    const strategiesDetails = await getStrategiesDetailsByAddress(address, strategies, userProvider)
    return strategiesDetails
  }
)

export const vaultStore = createSlice({
  name: 'vaultStore',
  initialState: {
    strategies: []
  },
  reducers: {},
  extraReducers: {
    [fetchNotifications.fulfilled]: (state, action) => {
      const {
        payload
      } = action
      if (!isArray(payload)) throw new Error('策略列表类型应为数组')
      state.strategies = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setStrategiesDataDetails
} = vaultStore.actions

export default vaultStore.reducer