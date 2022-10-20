import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import map from 'lodash/map'
import styles from './style'

const VAULTS = [
  { label: 'USDi', value: '/mutils', hash: '#/mutils' },
  { label: 'ETHi', value: '/ethi', hash: '#/ethi' },
  { label: 'USDr', value: '/usdr', hash: '#/usdr' },
  { label: 'ETHr', value: '/ethr', hash: '#/ethr' }
]

const useStyles = makeStyles(styles)

export default function VaultChange(props) {
  const classes = useStyles()
  const { hash } = window.location
  console.log('hash', hash)
  const [value, setValue] = useState(hash)
  
  if (!VAULTS.find(item => item.hash === hash)) {
    return props.children
  }

  const handleChange = (e, val) => {
    setValue(val)
    window.location.href = val
  }

  return (
    <>
      <div className={classes.container}>
        <Tabs centered classes={{ indicator: classes.indicator }} value={value} onChange={handleChange} aria-label="simple tabs example">
          {map(VAULTS, item => (
            <Tab key={item.label} label={item.label} value={item.hash} classes={{ root: classes.root }} className={classes.tab} />
          ))}
        </Tabs>
      </div>
      {props.children}
    </>
  )
}
