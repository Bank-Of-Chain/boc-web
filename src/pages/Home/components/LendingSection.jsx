import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CircularProgress from '@material-ui/core/CircularProgress'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Tooltip from '@material-ui/core/Tooltip'

// === Utils === //
import get from 'lodash/get'
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import isNaN from 'lodash/isNaN'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import { toFixed } from '@/helpers/number-format'
import { getDefiRate, getAPY } from '@/services/api-service'

// === Styles === //
import styles, { smStyle } from './lendingStyle'

const useStyles = makeStyles(styles)
const useSmStyles = makeStyles(smStyle)

const bocTitle = 'BoC'

const array = ['Compound', 'Aave', 'Coinbase', 'YearnFinance', 'Gemini', 'Bitfinex', 'Staking']
const apyType = {
  BlockFi: 'Fixed Rate',
  Nexo: 'Fixed Rate',
  Gemini: 'Fixed Rate',
  Coinbase: 'Fixed Rate',
  YearnFinance: 'Current Rate',
  Compound: 'Current Rate',
  Aave: 'Current Rate',
  BoC: 'Current Rate',
  Bitfinex: 'Fixed Rate'
}

export default function LendingSection() {
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  const smClasses = useSmStyles()
  const classes = useStyles({ classes: isLayoutSm ? smClasses : {} })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [ethiData, setEthiData] = useState([])

  useEffect(() => {
    setLoading(true)
    const chainId = '1'
    Promise.all([
      getAPY({ chainId, tokenType: 'USDi' }).then((data = 0) => {
        return {
          title: bocTitle,
          imagePath: '/logo.png',
          percent: parseFloat(data).toFixed(2),
          text: get(apyType, bocTitle, '')
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
          title: bocTitle,
          imagePath: '/logo.png',
          percent: parseFloat(data).toFixed(2),
          text: get(apyType, bocTitle, '')
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
          ...map(array, i => {
            return {
              title: i === 'YearnFinance' ? 'Yearn' : i,
              imagePath: svg[i],
              percent: parseFloat(data[i]),
              text: get(apyType, i, '')
            }
          })
        ])
        setEthiData([
          ethiObj,
          ...map(array, i => {
            return {
              title: i === 'YearnFinance' ? 'Yearn' : i,
              imagePath: ethiResp.svg[i],
              percent: parseFloat(ethiResp.data[i]),
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
  }, [])

  const renderJsx = (array = [], displayMaxValue) => {
    return (
      <GridContainer className={classes.block}>
        {map(
          filter(
            sortBy(array, o => {
              if (o.title === bocTitle) {
                return -10000
              }
              return -1 * o.percent
            }),
            o => !isNaN(o.percent)
          ),
          (item, i) => {
            const { title, imagePath, percent, text = '' } = item
            const nextPercent = percent / displayMaxValue
            const percentText = `${toFixed(nextPercent.toString(), 1e-2, 2)}%`
            return (
              <GridItem className={classNames(classes.item)} key={`${i}`} xs={12} sm={12} md={12}>
                <GridContainer className={classes.body}>
                  <GridItem className={classes.footer} xs={3} sm={3} md={3}>
                    <img
                      title={title}
                      src={imagePath}
                      alt={title}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null // prevents looping
                        currentTarget.src = '/default.png'
                      }}
                    />
                    <p>{title}</p>
                  </GridItem>
                  <GridItem className={classes.header} style={i === 0 ? { borderLeft: 0 } : {}} xs={9} sm={9} md={9}>
                    <Tooltip title={text}>
                      <div
                        className={classNames(classes.bar, text === 'Fixed Rate' && classes.fixed, title === bocTitle && classes.checked)}
                        // style={{ width: `calc(${percentText} - 4rem)` }}
                        style={{ width: percentText }}
                      >
                        <p className={classes.percent}>{percent}%</p>
                      </div>
                    </Tooltip>
                  </GridItem>
                </GridContainer>
              </GridItem>
            )
          }
        )}
      </GridContainer>
    )
  }

  const maxPercentItem = maxBy([...data, ...ethiData], 'percent')
  // left 25% percent width for text render
  const displayMaxValue = 1.25 * maxPercentItem?.percent
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Crypto Lending Interest Rates</h2>

      <div className={classes.chart}>
        <div className={classes.chartInner}>
          {loading ? (
            <GridContainer style={{ margin: '0 auto', padding: '10rem' }} justify="center">
              <CircularProgress />
            </GridContainer>
          ) : (
            <GridContainer className={classes.block} style={{ margin: '0 auto' }} justify="center">
              <GridItem sm={12} xs={6} md={6} lg={6} style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <p className={classes.colorful}>USDi</p>
                {renderJsx(data, displayMaxValue)}
              </GridItem>
              <GridItem sm={12} xs={6} md={6} lg={6}>
                <p className={classes.colorful}>ETHi</p>
                {renderJsx(ethiData, displayMaxValue)}
              </GridItem>
            </GridContainer>
          )}
        </div>
      </div>
      {!loading && (
        <div className={classNames(classes.label)}>
          <GridContainer>
            <GridItem style={{ lineHeight: '2rem' }}>
              <div className={classNames(classes.box)}></div>
              <span>Current Rate</span>
            </GridItem>
            <GridItem>
              <div className={classNames(classes.box1)}></div>
              <span>Fixed Rate</span>
            </GridItem>
          </GridContainer>
        </div>
      )}
    </div>
  )
}
