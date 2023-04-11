import { DASHBOARD_URL } from '@/constants'

/**
 * is host for Marketing
 * @returns
 */
export const isMarketingHost = () => {
  const host = window.location.host
  return host === 'web.bankofchain.io' || host === 'bankofchain.io'
}

/**
 *
 * @param {*} chain
 * @param {*} vault
 * @returns
 */
export const dashboardHost = (chain, vault) => {
  let host = DASHBOARD_URL
  if (isMarketingHost()) {
    host = 'https://dashboard.bankofchain.io'
  }
  return `${host}/#/?chain=${chain}&vault=${vault}`
}
