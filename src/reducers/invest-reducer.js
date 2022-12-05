import { createSlice } from '@reduxjs/toolkit'

export const metaStore = createSlice({
  name: 'investStore',
  initialState: {
    currentTab: 1
  },
  reducers: {
    setCurrentTab: (state, action) => {
      const { payload } = action
      state.currentTab = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setCurrentTab } = metaStore.actions

export default metaStore.reducer
