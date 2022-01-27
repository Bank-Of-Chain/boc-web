import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"

// === reducers === //
import { fetchNotifications } from "./../../reducers/vault-reducer"
import { setCurrentUserAddress } from "./../../reducers/meta-reducer"

// === Contants === //
import { VAULT_ADDRESS } from "./../../constants"

// === Utils === //
import isEmpty from "lodash/isEmpty"

export default function Index (props) {
  const { userProvider, address } = props
  const strategies = useSelector(state => state.vaultReducer.strategies)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isEmpty(address)) return
    dispatch(fetchNotifications({ address: VAULT_ADDRESS, userProvider }))
    dispatch(setCurrentUserAddress(address))
  }, [address, dispatch, userProvider])
  return (
    <div>
      <div>
        <span>{strategies?.length}</span>
      </div>
    </div>
  )
}
