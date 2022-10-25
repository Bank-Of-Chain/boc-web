import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import map from 'lodash/map'

// === Hooks === //
import { useLocation, useHistory } from 'react-router-dom'

// === Constants === //
import { NET_WORKS, CHAIN_ID } from '@/constants'
import { isProEnv } from '@/services/env-service'

// === Styles === //
import styles from './style'

const VAULTS = [
  { label: 'USDi', value: '/usdi' },
  { label: 'ETHi', value: '/ethi' },
  { label: 'USDr', value: '/usdr' },
  { label: 'ETHr', value: '/ethr' }
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
        <div className={classes.container}>
          <Tabs
            centered
            classes={{ indicator: classes.indicator }}
            value={pathname}
            onChange={(e, val) => changeRouter(val)}
            aria-label="simple tabs example"
          >
            {map(VAULTS, item => (
              <Tab key={item.label} label={item.label} value={item.value} classes={{ root: classes.root }} className={classes.tab} />
            ))}
          </Tabs>
        </div>
      )}
      {props.children}
    </Fragment>
  )
}
