import WalletConnectProvider from '@walletconnect/web3-provider'

// === Utils === //
import map from 'lodash/map'

// === Constants === //
import { RPC_URL } from '@/constants'

export const WALLETS = {
  MetaMask: {
    info: {
      name: 'MetaMask',
      value: 'injected', // param connectTo
      symbol: 'metamask', // current connect, lowercase
      logo: './images/wallets/MetaMask.png'
    },
    getProviderOption: () => {}
  },
  WalletConnect: {
    info: {
      name: 'WalletConnect',
      value: 'walletconnect',
      symbol: 'walletconnect',
      logo: './images/wallets/WalletConnect.png'
    },
    getProviderOption: () => ({
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: RPC_URL
        }
      }
    })
  }
}

export const WALLET_OPTIONS = map(WALLETS, wallet => wallet.info)
