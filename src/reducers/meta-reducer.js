import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_TIMEOUT = 3000

export const metaStore = createSlice({
  name: 'metaStore',
  initialState: {
    warmMsg: {
      open: false,
      type: '',
      message: '',
      timeout: DEFAULT_TIMEOUT
    }
  },
  reducers: {
    warmDialog: (state, action) => {
      const { payload } = action
      state.warmMsg = {
        ...payload,
        timeout: payload.timeout || DEFAULT_TIMEOUT
      }
    }
  }
})

// Action creators are generated for each case reducer function
export const { warmDialog } = metaStore.actions

export default metaStore.reducer
