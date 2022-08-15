import isEmpty from 'lodash/isEmpty'

/**
 * 是否已经安装metamask插件
 */
export const hasMetamaskInstalled = () => {
  return !isEmpty(window.ethereum)
}

/**
 * 确认当前是否已安装有效的钱包插件
 */
export const hasWalletInstalled = () => {
  return hasMetamaskInstalled()
}

export const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(window.navigator.userAgent)

export const isInMobileWalletApp = () => isMobile() && !isEmpty(window.ethereum)

export const isInMobileH5 = () => isMobile() && isEmpty(window.ethereum)
