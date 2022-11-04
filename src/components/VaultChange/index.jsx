import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import map from 'lodash/map'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Hooks === //
import { useLocation, useHistory } from 'react-router-dom'

// === Constants === //
import { NET_WORKS, CHAIN_ID } from '@/constants'
import { isProEnv } from '@/services/env-service'

// === Styles === //
import styles from './style'
import { groupBy } from 'lodash'
import classNames from 'classnames'

const VAULTS = [
  { label: 'USD Stable', value: '/usdi', row: 1 },
  { label: 'ETH Stable', value: '/ethi', row: 2 },
  { label: 'USD Plus', value: '/usdr', row: 1 },
  { label: 'ETH Plus', value: '/ethr', row: 2 }
]

const useStyles = makeStyles(styles)

export default function VaultChange(props) {
  const { changeNetwork } = props
  const classes = useStyles()
  const { push } = useHistory()
  const { pathname } = useLocation()

  const changeRouter = path => {
    let promise = Promise.resolve({})
    if (isProEnv()) {
      if (path === '/ethi' || path === '/usdi') {
        if (CHAIN_ID !== 1) {
          promise = changeNetwork(NET_WORKS[0])
        }
      } else if (path === '/ethr' || path === '/usdr') {
        if (CHAIN_ID !== 137) {
          promise = changeNetwork(NET_WORKS[1])
        }
      }
    }
    promise.then(() => {
      push(path)
    })
  }

  return (
    <Fragment>
      {pathname !== '/' && (
        <GridContainer>
          <GridItem xs={2} sm={2} md={3} style={{ padding: '0 2rem' }}></GridItem>
          <GridItem xs={9} sm={9} md={9} style={{ paddingRight: '2rem' }}>
            <div className={classes.wrapper}>
              <div className={classes.container}>
                {map(
                  groupBy(VAULTS, i => {
                    return i.row
                  }),
                  (item, itemIndex) => {
                    return (
                      <div className={classes.row} key={itemIndex}>
                        {map(item, ii => {
                          return (
                            <div
                              key={ii.value}
                              onClick={() => changeRouter(ii.value)}
                              className={classNames({ [classes.item]: true, [classes.checked]: ii.value === pathname })}
                            >
                              {ii.label}
                            </div>
                          )
                        })}
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </GridItem>
        </GridContainer>
      )}
      {props.children}
    </Fragment>
  )
}
