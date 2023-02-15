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
              <GridContainer className={classes.headerWrapper} justifycontent="center" alignItems="center">
                <GridItem md={6} className={classes.switchWrapper}>
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
                <GridItem md={6} className={classes.symbolWrapper}>
                  <div>Current Rate</div>
                  <div className={classNames(classes.box, classes.box3)}></div>
                  <div className={classNames(classes.box, classes.box1)}></div>
                  <div className={classes.label}>Fixed Rate</div>
                  <div className={classNames(classes.box, classes.box4)}></div>
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
          </GridContainer>
        </div>
      </div>
    </div>
  )
}
