import { createSlice } from "@reduxjs/toolkit";

// === Utils === //
import isEmpty from "lodash/isEmpty";

const DEFAULT_TIMEOUT = 3000;

export const metaStore = createSlice({
  name: "metaStore",
  initialState: {
    address: "",
    warmMsg: {
      open: false,
      type: "",
      message: "",
      timeout: DEFAULT_TIMEOUT,
    },
  },
  reducers: {
    setCurrentUserAddress: (state, action) => {
      const { payload } = action;
      if (isEmpty(payload)) throw new Error("address地址不可以为空");
      state.address = payload;
    },
    warmDialog: (state, action) => {
      const { payload } = action;
      state.warmMsg = {
        ...payload,
        timeout: payload.timeout || DEFAULT_TIMEOUT,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrentUserAddress, warmDialog } = metaStore.actions;

export default metaStore.reducer;
