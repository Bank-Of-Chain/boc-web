import { configureStore } from "@reduxjs/toolkit";
import metaReducer from "./reducers/meta-reducer";
import walletReducer from "./reducers/wallet-reducer";
import investReducer from "./reducers/invest-reducer";

export default configureStore({
  reducer: {
    metaReducer,
    walletReducer,
    investReducer,
  },
  // redux中的数据尽量都需要可序列化，建议不存结构很复杂的对象
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
