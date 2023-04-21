import React, { useState } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CircularProgress from '@material-ui/core/CircularProgress'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Tooltip from '@material-ui/core/Tooltip'
import IOSSwitch from '@/components/Switch/IOSSwitch'

// === Utils === //
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import sortBy from 'lodash/sortBy'
import findIndex from 'lodash/findIndex'
import isUndefined from 'lodash/isUndefined'
import { toFixed } from '@/helpers/number-format'

// === Services === //
import useApyFetch from '@/hooks/useApyFetch'

// === Constants === //
import { BOC_TITLE } from '@/constants/apy'

// === Styles === //
import styles, { smStyle } from './lendingStyle'

const useStyles = makeStyles(styles)
const useSmStyles = makeStyles(smStyle)

export default function LendingSectionV2() {
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  const smClasses = useSmStyles()
  const classes = useStyles({ classes: isLayoutSm ? smClasses : {} })

  const [isEthiEnable, setIsEthiEnable] = useState(true)
  const [isUsdiEnable, setIsUsdiEnable] = useState(true)

  const { loading, usdi, ethi } = useApyFetch('1')

  console.log('data=', usdi, ethi)

  const maxPercentItem = maxBy([...usdi, ...ethi], 'percent')
  const displayMaxValue = 1.25 * maxPercentItem?.percent

  let displayArray = []
  if (isEthiEnable === false) {
    displayArray = map(
      sortBy(usdi, o => {
        if (o.title === BOC_TITLE) {
          return -10000
        }
        return -1 * o.percent
      }),
      item => {
        return {
          ...item,
          usdiApy: item.percent
        }
      }
    )
  } else if (isUsdiEnable === false) {
    displayArray = map(
      sortBy(ethi, o => {
        if (o.title === BOC_TITLE) {
          return -10000
        }
        return -1 * o.percent
      }),
      item => {
        return {
          ...item,
          ethiApy: item.percent
        }
      }
    )
  } else if (isEthiEnable === true && isUsdiEnable === true) {
    const nextUsdi = sortBy(usdi, o => {
      if (o.title === BOC_TITLE) {
        return -10000
      }
      return -1 * o.percent
    })
    const nextEthi = sortBy(ethi, o => {
      if (o.title === BOC_TITLE) {
        return -10000
      }
      return -1 * o.percent
    })
    nextEthi.forEach(element => {
      const index = findIndex(nextUsdi, { title: element.title })
      if (index !== -1) {
        nextUsdi[index] = {
          ...nextUsdi[index],
          ethiApy: element.percent
        }
      } else {
        const { percent, ...others } = element
        nextUsdi.push({
          ...others,
          ethiApy: percent
        })
      }
    })
    displayArray = map(nextUsdi, item => {
      const { percent, ...others } = item
      return {
        ...others,
        usdiApy: percent
      }
    })
  }

  console.log('displayArray=', displayArray)

  return (
    <div className={classes.section}>
      <h2 className={classes.title}>Crypto Lending Interest Rates</h2>
      <div className={classes.chart}>
        <div className={classes.chartInner}>
          <GridContainer>
            <GridItem>
              <GridContainer className={classes.headerWrapper} alignItems="center">
                <GridItem md={6} xs={6} sm={6} className={classes.switchWrapper}>
                  <span>ETH</span>
                  <IOSSwitch
                    checked={isEthiEnable}
                    onChange={() => {
                      setIsEthiEnable(!isEthiEnable)
                      if (isEthiEnable && !isUsdiEnable) {
                        setIsUsdiEnable(true)
                      }
                    }}
                    name="checkedB"
                  />
                  <span className={classes.label}>USD</span>
                  <IOSSwitch
                    isUsdi
                    checked={isUsdiEnable}
                    onChange={() => {
                      setIsUsdiEnable(!isUsdiEnable)
                      if (isUsdiEnable && !isEthiEnable) {
                        setIsEthiEnable(true)
                      }
                    }}
                    name="checkedB"
                  />
                </GridItem>
                <GridItem md={6} xs={6} sm={6} className={classes.symbolWrapper}>
                  <div>Current Rate</div>&nbsp;
                  <div className={classNames(classes.box, classes.box3)}></div>&nbsp;
                  <div className={classNames(classes.box, classes.box1)}></div>&nbsp;
                  <div className={classes.label}>Fixed Rate</div>&nbsp;
                  <div className={classNames(classes.box, classes.box4)}></div>&nbsp;
                  <div className={classNames(classes.box, classes.box2)}></div>
                </GridItem>
              </GridContainer>
            </GridItem>
            <GridItem>
              <GridContainer className={classes.wrapper} justify="space-around">
                {loading ? (
                  <CircularProgress />
                ) : (
                  map(displayArray, (item, i) => {
                    const { title, imagePath, usdiApy, ethiApy, text = '' } = item
                    const nextUsdiPercent = usdiApy / displayMaxValue
                    const usdiPercentText = `${toFixed(nextUsdiPercent.toString(), 1e-2, 2)}%`
                    const nextEthiPercent = ethiApy / displayMaxValue
                    const ethiPercentText = `${toFixed(nextEthiPercent.toString(), 1e-2, 2)}%`
                    return (
                      <div className={classNames(classes.item)} key={`${i}`}>
                        <GridContainer className={classes.body}>
                          <GridItem className={classes.header} style={i === 0 ? { borderLeft: 0 } : {}}>
                            {!isUndefined(usdiApy) && (
                              <Tooltip title={text}>
                                <div
                                  className={classNames(classes.bar, classes.usdiBar, text === 'Fixed Rate' && classes.fixed)}
                                  style={{ height: usdiPercentText }}
                                >
                                  <p>{usdiApy}%</p>
                                </div>
                              </Tooltip>
                            )}
                            {!isUndefined(ethiApy) && (
                              <Tooltip title={text}>
                                <div
                                  className={classNames(
                                    classes.bar,
                                    classes.ethiBar,
                                    text === 'Fixed Rate' && classes.fixed,
                                    !isUndefined(usdiApy) && classes.margin
                                  )}
                                  style={{ height: ethiPercentText }}
                                >
                                  <p>{ethiApy}%</p>
                                </div>
                              </Tooltip>
                            )}
                          </GridItem>
                          <GridItem className={classes.footer}>
                            <img
                              className={classes.img}
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
                      </div>
                    )
                  })
                )}
              </GridContainer>
            </GridItem>
            <GridItem md={12} xs={12} sm={12}>
              <p style={{ color: '#ec4899', background: 'yellow', padding: '1rem', margin: '1rem' }}>
                <svg
                  style={{ verticalAlign: 'middle' }}
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="sound"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M625.9 115c-5.9 0-11.9 1.6-17.4 5.3L254 352H90c-8.8 0-16 7.2-16 16v288c0 8.8 7.2 16 16 16h164l354.5 231.7c5.5 3.6 11.6 5.3 17.4 5.3 16.7 0 32.1-13.3 32.1-32.1V147.1c0-18.8-15.4-32.1-32.1-32.1zM586 803L293.4 611.7l-18-11.7H146V424h129.4l17.9-11.7L586 221v582zm348-327H806c-8.8 0-16 7.2-16 16v40c0 8.8 7.2 16 16 16h128c8.8 0 16-7.2 16-16v-40c0-8.8-7.2-16-16-16zm-41.9 261.8l-110.3-63.7a15.9 15.9 0 00-21.7 5.9l-19.9 34.5c-4.4 7.6-1.8 17.4 5.8 21.8L856.3 800a15.9 15.9 0 0021.7-5.9l19.9-34.5c4.4-7.6 1.7-17.4-5.8-21.8zM760 344a15.9 15.9 0 0021.7 5.9L892 286.2c7.6-4.4 10.2-14.2 5.8-21.8L878 230a15.9 15.9 0 00-21.7-5.9L746 287.8a15.99 15.99 0 00-5.8 21.8L760 344z"></path>
                </svg>
                &nbsp; The BOC team is preparing for the BOC V2.0 release development and release, so the regular operation of the current online V1.0
                release is suspended (including regular harvesting and warehousing). Therefore, it is expected that BoC APY will continue to decline
                even to 0% in the near term. BOC V1.0 has invested in the strategy is still operating normally and the actual yield will be reflected
                in the future when the strategy is reaped at an appropriate time. We&apos;re going to bring you a whole new version. Please contact us
                if you have any questions or suggestions (contact@bankofchain.io)
              </p>
            </GridItem>
          </GridContainer>
        </div>
      </div>
    </div>
  )
}
