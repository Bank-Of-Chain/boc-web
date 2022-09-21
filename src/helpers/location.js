/**
 * is host for Marketing
 * @returns
 */
export const isMarketingHost = () => {
  const host = window.location.host
  return host === 'web.bankofchain.io' || host === 'bankofchain.io' || host === 'qa03-sg.bankofchain.io'
}
