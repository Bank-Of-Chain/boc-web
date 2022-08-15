import React from 'react'
import PropTypes from 'prop-types'
import useLookupAddress from '@/hooks/useLookupAddress'

function Address(props) {
  const ens = useLookupAddress(props.ensProvider, props.address)

  let displayAddress = props.address.substr(0, 6)
  if (ens && ens.indexOf('0x') < 0) {
    displayAddress = ens
  } else if (props.size === 'short') {
    displayAddress += '...' + props.address.substr(-4)
  } else if (props.size === 'long') {
    displayAddress = props.address
  }
  return <span>{displayAddress}</span>
}

Address.propTypes = {
  address: PropTypes.string.isRequired
}

export default Address
