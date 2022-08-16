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

const bocTitle = 'BOC'

const array = ['Compound', 'Aave', 'Coinbase', 'BlockFi', 'Nexo', 'Celsius', 'YearnFinance', 'Gemini', 'Bitfinex']
const apyType = {
  BlockFi: 'Fixed Rate',
  Celsius: 'Fixed Rate',
  Nexo: 'Fixed Rate',
  Gemini: 'Fixed Rate',
  Coinbase: 'Fixed Rate',
  YearnFinance: 'Current Rate',
  Compound: 'Current Rate',
  Aave: 'Current Rate',
  BOC: 'Current Rate',
  Bitfinex: 'Fixed Rate'
}

export default function LendingSection() {
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  const smClasses = useSmStyles()
  const classes = useStyles({ classes: isLayoutSm ? smClasses : {} })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAPY({ chainId: '1' }).then((data = 0) => {
        return {
          title: bocTitle,
          imagePath: '/logo.png',
          percent: parseFloat(data).toFixed(2),
          text: get(apyType, bocTitle, '')
        }
      }),
      getDefiRate().catch(() =>
        Promise.resolve({
          data: {},
          svg: {}
        })
      )
    ])
      .then(([obj, resp]) => {
        const { data, svg } = resp
        return [
          obj,
          ...map(array, i => {
            return {
              title: i === 'YearnFinance' ? 'Yearn' : i,
              imagePath: svg[i],
              percent: parseFloat(data[i]),
              text: get(apyType, i, '')
            }
          })
        ]
      })
      .then(setData)
      .finally(() => {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      })
  }, [])
  const maxPercentItem = maxBy(data, 'percent')
  const displayMaxValue = 5 * Math.ceil(maxPercentItem?.percent / 5)
  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Crypto Lending Interest Rates.</h2>
      <div className={classNames(classes.label)}>
        <GridContainer>
          <GridItem style={{ lineHeight: '2rem' }}>
            <div className={classNames(classes.box)}></div>
            <span style={{ fontSize: '0.75rem' }}>Current Rate</span>
          </GridItem>
          <GridItem>
            <div className={classNames(classes.box1)}></div>
            <span style={{ fontSize: '0.75rem' }}>Fixed Rate</span>
          </GridItem>
        </GridContainer>
      </div>
      <div className={classes.chart}>
        <div className={classes.chartInner}>
          {loading ? (
            <GridContainer style={{ margin: '0 auto' }} justify="center">
              <CircularProgress />
            </GridContainer>
          ) : (
            <GridContainer style={{ margin: '0 auto' }} justify="center">
              {map(
                filter(
                  sortBy(data, o => {
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
                    <GridItem className={classNames(classes.item)} key={`${i}`} xs={1} sm={1} md={1}>
                      <GridContainer className={classes.body}>
                        <GridItem className={classes.header} style={i === 0 ? { borderLeft: 0 } : {}}>
                          <Tooltip title={text}>
                            <div
                              className={classNames(classes.bar, text === 'Fixed Rate' && classes.fixed, title === bocTitle && classes.checked)}
                              style={{ height: percentText }}
                            >
                              <p>{percent}%</p>
                            </div>
                          </Tooltip>
                        </GridItem>
                        <GridItem className={classes.footer}>
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
                      </GridContainer>
                    </GridItem>
                  )
                }
              )}
            </GridContainer>
          )}
        </div>
      </div>
    </div>
  )
}