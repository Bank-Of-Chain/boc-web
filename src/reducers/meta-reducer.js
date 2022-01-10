import {
  createSlice
} from '@reduxjs/toolkit'

// === Utils === //
import isEmpty from 'lodash/isEmpty'

export const metaStore = createSlice({
  name: 'metaStore',
  initialState: {
    address: ''
  },
  reducers: {
    setCurrentUserAddress: (state, action) => {
      const {
        payload
      } = action
      if (isEmpty(payload)) throw new Error('address地址不可以为空')
      state.address = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setCurrentUserAddress
} = metaStore.actions

export default metaStore.reducer