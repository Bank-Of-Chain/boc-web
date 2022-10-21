import { useCallback, useEffect, useState } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import flatten from 'lodash/flatten'

// === Hooks === //
import useUserAddress from '@/hooks/useUserAddress'

// === Constants === //
import { USDC_ADDRESS_MATIC, WETH_ADDRESS_MATIC, ZERO_ADDRESS } from '@/constants/tokens'

const { Contract } = ethers

const tokens = [WETH_ADDRESS_MATIC, USDC_ADDRESS_MATIC]

const useVaultFactory = (vaultFactoryAddress, VAULT_FACTORY_ABI, userProvider) => {
  const [vaultImplList, setVaultImplList] = useState([])
  const [personalVault, setPersonalVault] = useState([])
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const userAddress = useUserAddress(userProvider)

  const getVaultImplList = useCallback(() => {
    if (isEmpty(vaultFactoryAddress) || isEmpty(userProvider)) return
    const vaultFactoryContract = new Contract(vaultFactoryAddress, VAULT_FACTORY_ABI, userProvider)
    vaultFactoryContract.getVaultImplList().then(setVaultImplList)
  }, [vaultFactoryAddress, userProvider, VAULT_FACTORY_ABI])

  const getVaultImplListByUser = useCallback(() => {
    if (isEmpty(vaultFactoryAddress) || isEmpty(userProvider) || isEmpty(vaultImplList) || isEmpty(userAddress)) return
    setLoading(true)
    const vaultFactoryContract = new Contract(vaultFactoryAddress, VAULT_FACTORY_ABI, userProvider)
    const requestArray = map(vaultImplList, implAddress => {
      return Promise.all(
        map(tokens, (arrayItem, index) => {
          return vaultFactoryContract.vaultAddressMap(userAddress, implAddress, index).then(rs => {
            if (rs === ZERO_ADDRESS) return { hasCreate: false, type: implAddress, token: arrayItem }
            return {
              address: rs,
              type: implAddress,
              hasCreate: true,
              token: arrayItem
            }
          })
        })
      )
    })
    Promise.all(requestArray)
      .then(resp => {
        setPersonalVault(flatten(resp))
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false)
        }, 3000)
      })
  }, [userAddress, vaultFactoryAddress, userProvider, vaultImplList, VAULT_FACTORY_ABI])

  const addVault = useCallback(
    async (token, type) => {
      setAdding(true)
      const vaultFactoryContract = new Contract(vaultFactoryAddress, VAULT_FACTORY_ABI, userProvider)
      await vaultFactoryContract
        .connect(userProvider.getSigner())
        .createNewVault(token, type)
        .then(tx => tx.wait())
        .then(getVaultImplListByUser)
        .finally(() => {
          setAdding(false)
        })
    },
    [vaultFactoryAddress, userProvider, getVaultImplListByUser, VAULT_FACTORY_ABI]
  )

  const deleteVault = useCallback(
    async (type, index) => {
      setAdding(true)
      const vaultFactoryContract = new Contract(vaultFactoryAddress, VAULT_FACTORY_ABI, userProvider)
      vaultFactoryContract
        .connect(userProvider.getSigner())
        .deleteVaultAddressMapForDebug(userAddress, type, index)
        .then(tx => tx.wait())
        .then(getVaultImplListByUser)
        .finally(() => {
          setAdding(false)
        })
    },
    [vaultFactoryAddress, getVaultImplListByUser, userAddress, userProvider, VAULT_FACTORY_ABI]
  )

  useEffect(getVaultImplList, [getVaultImplList])

  useEffect(getVaultImplListByUser, [getVaultImplListByUser])

  return {
    vaultFactoryAddress,
    vaultImplList,
    personalVault,
    adding,
    loading,
    // functions
    addVault,
    deleteVault
  }
}

export default useVaultFactory
