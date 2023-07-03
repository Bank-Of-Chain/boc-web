import { useState, useEffect } from 'react'

// === Utils === //
import get from 'lodash-es/get'
import map from 'lodash-es/map'

// === Services === //
import { getDefiRate, getAPY } from '@/services/api-service'

// === Constants === //
import { BOC_TITLE, usdiArray, ethiArray, apyType } from '@/constants/apy'

export default function useApyFetch(chain = '1') {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [ethiData, setEthiData] = useState([])

  useEffect(() => {
    setLoading(true)
    const chainId = chain
    Promise.all([
      getAPY({ chainId, tokenType: 'USDi' }).then((data = 0) => {
        return {
          title: BOC_TITLE,
          imagePath: '/logo.png',
          percent: 1 * parseFloat(data).toFixed(2),
          text: get(apyType, BOC_TITLE, '')
        }
      }),

      getDefiRate(chainId, 'USDi').catch(() =>
        Promise.resolve({
          data: {},
          svg: {}
        })
      ),
      getAPY({ chainId, tokenType: 'ETHi' }).then((data = 0) => {
        return {
          title: BOC_TITLE,
          imagePath: '/logo.png',
          percent: 1 * parseFloat(data).toFixed(2),
          text: get(apyType, BOC_TITLE, '')
        }
      }),
      getDefiRate(chainId, 'ETHi').catch(() =>
        Promise.resolve({
          data: {},
          svg: {}
        })
      )
    ])
      .then(([obj, resp, ethiObj, ethiResp]) => {
        const { data, svg } = resp
        setData([
          obj,
          ...map(usdiArray, i => {
            return {
              title: i === 'YearnFinance' ? 'Yearn' : i,
              imagePath: svg[i] || '/default.png',
              percent: parseFloat(data[i] || '0'),
              text: get(apyType, i, '')
            }
          })
        ])
        setEthiData([
          ethiObj,
          ...map(ethiArray, i => {
            return {
              title: i === 'YearnFinance' ? 'Yearn' : i,
              imagePath: ethiResp.svg[i] || '/default.png',
              percent: parseFloat(ethiResp.data[i] || 0),
              text: get(apyType, i, '')
            }
          })
        ])
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      })
  }, [chain])

  return {
    loading,
    usdi: data,
    ethi: ethiData
  }
}
