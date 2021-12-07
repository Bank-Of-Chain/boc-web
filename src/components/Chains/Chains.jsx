import React from "react"

// mterial-ui components
import { makeStyles } from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip";

// === Utils === //
import map from 'lodash/map';

const styles = {
  img: {
    width: '2rem',
    height: '2rem',
    marginRight: '10px',
    maxWidth: '100%',
    padding: 2,
    verticalAlign: 'middle',
    background: '#fff',
    cursor: 'pointer',
    border: '1px solid #000',
  }
}

const useStyles = makeStyles(styles)

export default function Chains (props) {
  const { array, handleClick } = props
  const classes = useStyles()
  return (
    <div style={{ textAlign: 'center' }}>
      {map(array, item => (
        <Tooltip
          key={item.chainId}
          title={item.name}
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <span onClick={() => handleClick(item)}>
            <img className={classes.img} src={require(`./images/${item.chainId}.svg`)} alt='' />
          </span>
        </Tooltip>
      ))}
    </div>
  )
}

Chains.propTypes = {}
