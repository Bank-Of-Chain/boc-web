import React, { Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Tabs from '@/components/CustomTabs/CustomTabs'
import map from 'lodash/map'

// === Hooks === //
import { useLocation, useHistory } from 'react-router-dom'

// === Constants === //
import { NET_WORKS, CHAIN_ID } from '@/constants'
import { isProEnv } from '@/services/env-service'

// === Styles === //
import styles from './style'
import { findIndex, isEmpty } from 'lodash'

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

  const changeRouter = (event, index) => {
    const clickItem = VAULTS[index]
    if (isEmpty(clickItem)) return
    const { value: path } = clickItem
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
            value={findIndex(VAULTS, { value: pathname })}
            indicatorColor="primary"
            textColor="primary"
            onChange={changeRouter}
            tabs={map(VAULTS, item => {
              return {
                tabName: item.label,
                tabContent: null
              }
            })}
          />
        </div>
      )}
      {props.children}
    </Fragment>
  )
}
