import {
  createSlice
} from '@reduxjs/toolkit'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { SafeAppWeb3Modal } from "@gnosis.pm/safe-apps-web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { Web3Provider } from "@ethersproject/providers"

const WALLETS = {
  MetaMask: {
    info: {
      name: "MetaMask",
      value: "injected", // connectTo 参数
      symbol: "metamask", // 是否为当前连接判断, 统一全小写
      logo: "./images/wallets/MetaMask.png"
    },
    getProviderOption: () => {}
  },
  WalletConnect: {
    info: {
      name: "WalletConnect",
      value: "walletconnect",
      symbol: "walletconnect",
      logo: "./images/wallets/WalletConnect.png",
    },
    getProviderOption: () => ({
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: {
            1: "https://eth-mainnet.alchemyapi.io/v2/cDrbyA3BIcXQcF3EYjsf_PX8qC6YBlhV",
            56: "https://bsc-dataseed.binance.org/",
            137: "https://rpc-mainnet.maticvigil.com"
          }
        }
      }
    })
  }
}

export const WALLET_OPTIONS = map(WALLETS, (wallet) => wallet.info)

export const createWeb3Modal = () => {
  let providerOptions = {}
  keys(WALLETS).forEach((name) => {
    providerOptions = {
      ...providerOptions,
      ...WALLETS[name].getProviderOption()
    }
  })
  return new SafeAppWeb3Modal({
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions
  })
}


export const metaStore = createSlice({
  name: 'walletStore',
  initialState: {
    web3Modal: createWeb3Modal(),
    provider: undefined,
    userProvider: undefined,
  },
  reducers: {
    setProvider: (state, action) => {
      const {
        payload
      } = action
      state.provider = payload
      state.userProvider = payload ? new Web3Provider(payload) : undefined
    },
    setWeb3Modal: (state, action) => {
      const {
        payload
      } = action
      state.web3Modal = payload
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setProvider,
  setWeb3Modal
} = metaStore.actions

export default metaStore.reducer
