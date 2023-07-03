import React from 'react'

// mterial-ui components
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

// === Utils === //
import map from 'lodash/map'

const styles = {
  img: {
    width: '3.5rem',
    height: '3.5rem',
    marginRight: '24px',
    maxWidth: '100%',
    padding: 2,
    verticalAlign: 'middle',
    cursor: 'pointer'
  }
}

const useStyles = makeStyles(styles)

export default function Chains(props) {
  const { array, handleClick, maskStyle } = props
  const classes = useStyles()
  return (
    <div style={maskStyle}>
      {map(array, item => (
        <Tooltip key={item.chainId} title={item.name} placement={window.innerWidth > 959 ? 'top' : 'left'} classes={{ tooltip: classes.tooltip }}>
          <img onClick={() => handleClick(item)} className={classes.img} src={`/images/chains/${item.chainId}.png`} alt="" />
        </Tooltip>
      ))}
    </div>
  )
}

Chains.propTypes = {}
