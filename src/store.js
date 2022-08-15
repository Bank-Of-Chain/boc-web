import { configureStore } from '@reduxjs/toolkit'

// === Reducers === //
import metaReducer from './reducers/meta-reducer'
import walletReducer from './reducers/wallet-reducer'
import investReducer from './reducers/invest-reducer'

export default configureStore({
  reducer: {
    metaReducer,
    walletReducer,
    investReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
