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