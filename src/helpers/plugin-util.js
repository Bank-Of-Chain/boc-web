import isEmpty from 'lodash-es/isEmpty'

/**
 * check if metamask installed
 * @returns boolean
 */
export const hasMetamaskInstalled = () => {
  // TODO: check by symbol "metamask"
  return !isEmpty(window.ethereum)
}

/**
 * check if wallet installed
 * @returns boolean
 */
export const hasWalletInstalled = () => {
  // TODO: check metamask and walletconnect
  return hasMetamaskInstalled()
}

export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(window.navigator.userAgent)

export const isInMobileWalletApp = () => isMobile() && hasWalletInstalled()

export const isInMobileH5 = () => isMobile() && !hasWalletInstalled()
