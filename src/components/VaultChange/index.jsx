import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import map from 'lodash/map'

// === Hooks === //
import { useLocation, useHistory } from 'react-router-dom'

import styles from './style'

const VAULTS = [
  { label: 'USDi', value: '/usdi', hash: '#/usdi' },
  { label: 'ETHi', value: '/ethi', hash: '#/ethi' },
  { label: 'USDr', value: '/usdr', hash: '#/usdr' },
  { label: 'ETHr', value: '/ethr', hash: '#/ethr' }
]

const useStyles = makeStyles(styles)

export default function VaultChange(props) {
  const classes = useStyles()
  const { push } = useHistory()
  const { pathname } = useLocation()

  return (
    <>
      <div className={classes.container}>
        <Tabs centered classes={{ indicator: classes.indicator }} value={pathname} onChange={(e, val) => push(val)} aria-label="simple tabs example">
          {map(VAULTS, item => (
            <Tab key={item.label} label={item.label} value={item.value} classes={{ root: classes.root }} className={classes.tab} />
          ))}
        </Tabs>
      </div>
      {props.children}
    </>
  )
}
