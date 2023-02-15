import React from 'react'
import PropTypes from 'prop-types'

// === Utils === //
import isString from 'lodash/isString'
import { isArray } from 'lodash'
import map from 'lodash/map'

const DEFAULT = `/default.png`

const IconArray = ({ array = [], size = 24, style }) => {
  const imageRender = (address, i) => (
    <img
      title={address}
      key={`${address + i}`}
      style={{
        width: size,
        borderRadius: '50%',
        verticalAlign: 'sub',
        marginLeft: i === 0 ? 0 : -10,
        zIndex: array.length - i
      }}
      src={`/images/${address}.png`}
      fallback={DEFAULT}
    />
  )

  if (isString(array)) {
    return imageRender(array, 0)
  } else if (isArray(array)) {
    return <div style={style}>{map(array, (address, i) => imageRender(address, i))}</div>
  }
  return <span />
}

IconArray.propTypes = {
  array: PropTypes.array,
  size: PropTypes.any
}

export default IconArray
