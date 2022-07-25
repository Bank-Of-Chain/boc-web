import { createSlice } from "@reduxjs/toolkit";
import keys from "lodash/keys";
import { SafeAppWeb3Modal } from "@gnosis.pm/safe-apps-web3modal";
import { Web3Provider } from "@ethersproject/providers";
import { WALLETS } from "../constants/wallet";

export const createWeb3Modal = () => {
  let providerOptions = {};
  keys(WALLETS).forEach((name) => {
    providerOptions = {
      ...providerOptions,
      ...WALLETS[name].getProviderOption(),
    };
  });
  return new SafeAppWeb3Modal({
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions,
  });
};

export const metaStore = createSlice({
  name: "walletStore",
  initialState: {
    web3Modal: createWeb3Modal(),
    provider: undefined,
    userProvider: undefined,
  },
  reducers: {
    setProvider: (state, action) => {
      const { payload } = action;
      state.provider = payload;
      state.userProvider = payload ? new Web3Provider(payload) : undefined;
    },
    setWeb3Modal: (state, action) => {
      const { payload } = action;
      state.web3Modal = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setProvider, setWeb3Modal } = metaStore.actions;

export default metaStore.reducer;
