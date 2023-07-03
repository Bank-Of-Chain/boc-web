import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import TripOriginIcon from '@material-ui/icons/TripOrigin'

// === Utils === //
import map from 'lodash-es/map'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Styles === //
import styles from './roadMapV2Style'

const useStyles = makeStyles(styles)

const DONE = <TripOriginIcon style={{ fontSize: 30 }} />
const UNDONE = <FiberManualRecordIcon style={{ fontSize: 30 }} />

const paths = [
  {
    title: 'Q1 2022',
    color: '#95AAB9',
    background: '#2C2D30',
    data: [
      {
        title: ['Launching', 'test'],
        done: true
      }
    ]
  },
  {
    title: 'Q2 2022',
    color: '#558CDE',
    background: '#2B2E32',
    data: [
      {
        title: ['BoC USDi &', 'ETHi vault'],
        done: true
      }
    ]
  },
  {
    title: 'Q4 2022',
    color: '#558CDE',
    background: '#2B2E32',
    data: [
      {
        title: ['External', 'audit'],
        done: false
      },
      {
        title: ['Risk on', 'strategy'],
        done: false
      }
    ]
  },
  {
    title: 'Q1 2023',
    color: '#D28EC1',
    background: '#2B2E32',
    data: [
      {
        title: ['Layer2s'],
        done: false
      },
      {
        title: ['Governance token'],
        done: false
      }
    ]
  },
  // {
  //   title: 'Q2_2023',
  //   color: '#D28EC1',
  //   background: '#312B33',
  //   data: [
  //     {
  //       title: ['Smart Contracts', 'Insurance'],
  //       done: false
  //     },
  //     {
  //       title: ['Alt-coins', 'farming'],
  //       done: false
  //     }
  //   ]
  // },
  {
    title: 'future & beyond',
    color: '#7E6DD2',
    background: '#292835',
    data: [
      {
        title: ['Personal', 'banking'],
        done: false
      },
      {
        title: ['Institutional', 'services'],
        done: false
      },
      {
        title: ['Payment', 'solution'],
        done: false
      }
    ]
  }
]

export default function RoadMapSectionV2() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const widthCalc = (isLayoutSm, length) => {
    if (isLayoutSm) {
      if (length === 1) return 23
      if (length === 2) return 30
      return 12.5 * length
    }
    return 17 * length
  }

  return (
    <div className={classes.roadmap}>
      <h3 className={classes.title}>Pathway ...</h3>
      <GridContainer>
        {map(paths, (item, i) => {
          const { title, color, data, background } = item
          let titleStyle = {
            background,
            border: `2px dashed ${color}`
          }
          if (i === paths.length - 1) {
            titleStyle.fontSize = '0.75rem'
          }
          return (
            <GridItem style={{ lineHeight: '2rem' }} key={i} xs={12} sm={12} md={12}>
              <div
                className={classes.text}
                style={{
                  color,
                  background,
                  border: `2px dashed ${color}`,
                  width: `${widthCalc(isLayoutSm, data.length)}rem`
                }}
              >
                <div className={classes.itemTitle} style={titleStyle}>
                  {title}
                </div>
                <div className={classes.dataItemContainer}>
                  {map(data, (dataItem, ii) => {
                    const { title, done } = dataItem
                    const comp = done ? DONE : UNDONE
                    return (
                      <div className={classes.textInner} style={{ color, width: `${100 / data.length}%` }} key={ii}>
                        {title.map(item => (
                          <div key={item} className={classes.textIn}>
                            {item}
                          </div>
                        ))}
                        <div className={classes.dot}>{comp}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GridItem>
          )
        })}
      </GridContainer>
      <div className={classes.bottomButton}>... To a full-fledged Decentralized Bank</div>
    </div>
  )
}
