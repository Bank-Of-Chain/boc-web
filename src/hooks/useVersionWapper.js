import React from 'react'

// === Constants === //
import { VAULTS } from '@/constants'

// === Utils === //
import find from 'lodash/find'
import useAbiResolver from '@/hooks/useAbiResolver'

export default function useVersionWapper(WrappedComponent, id) {
  const item = find(VAULTS, { id }) || {}
  const abi = useAbiResolver(item.abi_version)

  return function Wrapper(props) {
    const nextProps = {
      ...abi,
      ...item,
      ...props
    }
    return <WrappedComponent {...nextProps} />
  }
}
