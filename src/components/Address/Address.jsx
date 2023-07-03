import React from 'react'
import PropTypes from 'prop-types'
import useLookupAddress from '@/hooks/useLookupAddress'

// === Utils === //
import isEmpty from 'lodash-es/isEmpty'

const Address = props => {
  const { ensProvider, address = '' } = props
  if (isEmpty(address)) {
    return ''
  }
  const ens = useLookupAddress(ensProvider, address)

  let displayAddress = address.substr(0, 6)

  if (ens && ens.indexOf('0x') < 0) {
    displayAddress = ens
  } else if (props.size === 'short') {
    displayAddress += '...' + address.substr(-4)
  } else if (props.size === 'long') {
    displayAddress = address
  }
  return <span>{displayAddress}</span>
}

Address.propTypes = {
  address: PropTypes.string.isRequired
}

export default Address
