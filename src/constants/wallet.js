// === Utils === //
import map from 'lodash/map'

export const WALLETS = {
  MetaMask: {
    info: {
      name: 'MetaMask',
      value: 'injected', // param connectTo
      symbol: 'metamask', // current connect, lowercase
      logo: './images/wallets/MetaMask.png'
    },
    getProviderOption: () => {}
  }
}

export const WALLET_OPTIONS = map(WALLETS, wallet => wallet.info)
