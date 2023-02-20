import { useEffect, useState } from 'react'

// === Services === //
import { getProfits, getPersonTvlArray, getMonthProfits, getAccountApyByAddress, getLatestProfit } from '@/services/api-service'

// === Utils === //
import moment from 'moment'
import { toFixed } from '@/helpers/number-format'
import { map, isEmpty, reverse, find } from 'lodash'

// === Constants === //
import { APY_DURATION } from '@/constants/apy-duration'
import { USDI_BN_DECIMALS } from '@/constants/usdi'
import { ETHI_DISPLAY_DECIMALS } from '@/constants/ethi'
import { VAULT_TYPE, TOKEN_DISPLAY_DECIMALS } from '@/constants/vault'

const dataMerge = (account, chain, vault, tokenType) => {
  if (isEmpty(account)) return Promise.resolve({})

  const params = {
    chainId: chain,
    tokenType
  }
  // date string of UTC0 today
  const date = moment().subtract(1, 'days').utc(0).format('yyyy-MM-DD')
  return Promise.all([
    // get weekly apy
    getAccountApyByAddress(account, date, {
      duration: APY_DURATION.weekly,
      ...params
    }),
    // get monthly apy
    getAccountApyByAddress(account, date, {
      duration: APY_DURATION.monthly,
      ...params
    }),
    // get tvl
    getPersonTvlArray(account, params),
    // get monthly profit
    getMonthProfits(account, params),
    getProfits(account, params),
    getLatestProfit(account, chain, tokenType).catch(() => {
      return {
        profit: '0'
      }
    })
  ])
    .then(rs => {
      const [day7Apy, day30Apy, tvls, monthProfits, profit, latestProfit, balanceOfToken] = rs
      const displayDecimals = {
        [VAULT_TYPE.USDi]: TOKEN_DISPLAY_DECIMALS,
        [VAULT_TYPE.ETHi]: ETHI_DISPLAY_DECIMALS
      }[vault]

      const monthProfitsData = []
      for (let i = 0; i < 12; i++) {
        const month = moment().utcOffset(0).subtract(i, 'months').format('YYYY-MM')
        const profit = find(monthProfits, item => item.month === month)?.profit || 0
        monthProfitsData.push(toFixed(profit, USDI_BN_DECIMALS, displayDecimals))
      }
      const nextData = {
        day7Apy,
        day30Apy,
        tvls: reverse(
          map(tvls.content, item => ({
            date: item.date,
            balance: toFixed(item.balance, USDI_BN_DECIMALS, displayDecimals)
          }))
        ),
        monthProfits: reverse(monthProfitsData),
        profit: profit.profit,
        balanceOfToken,
        latestProfit
      }

      return nextData
    })
    .catch(error => {
      console.error('init PersonalV2 data failed', error)
      return {}
    })
}

export default function usePersonalData(chain, vault, address, tokenType) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEmpty(address) || isEmpty(chain)) {
      return
    }
    setLoading(true)
    dataMerge(address?.toLowerCase(), chain, vault, tokenType)
      .then(setData)
      .finally(() => setLoading(false))
  }, [address, chain, vault, tokenType])

  return {
    dataSource: data,
    loading: loading
  }
}
