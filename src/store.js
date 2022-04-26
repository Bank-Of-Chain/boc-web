import { configureStore } from '@reduxjs/toolkit'
import metaReducer from './reducers/meta-reducer'

export default configureStore({
  reducer: {
    metaReducer
  },
  // redux中的数据尽量都需要可序列化，建议不存结构很复杂的对象
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: false,
  // })
})