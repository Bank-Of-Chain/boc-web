import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getWalletName } from '../helpers/wallet'
import { setProvider } from "../reducers/wallet-reducer"

function useWallet() {
  const dispatch = useDispatch()
  const web3Modal = useSelector(state => state.walletReducer.web3Modal)
  const provider = useSelector(state => state.walletReducer.provider)
  const userProvider = useSelector(state => state.walletReducer.userProvider)
  const [chainId, setChainId] = useState()

  const connectTo = useCallback(async (name) => {
    const provider = await web3Modal.connectTo(name)
    dispatch(setProvider(provider))
    return provider
  }, [web3Modal, dispatch])

  const requestProvider = useCallback(async () => {
    const provider = await web3Modal.requestProvider()
    dispatch(setProvider(provider))
    return provider
  }, [web3Modal, dispatch])

  const connect = useCallback(async (name) => {
    return name ? connectTo(name) : requestProvider()
  }, [connectTo, requestProvider])

  const disconnectPassive = useCallback(async () => {
    // walletconnect 异常关闭下 session 会一直存在，这边做个移除
    localStorage.removeItem("walletconnect")
    await web3Modal.clearCachedProvider()
    setTimeout(() => {
      window.location.reload()
    }, 1)
  }, [web3Modal])

  const disconnect = useCallback(async () => {
    if (provider?.disconnect) {
      await provider.disconnect()
    }
    await disconnectPassive()
  }, [provider, disconnectPassive])

  const getChainId = (userProvider) => {
    return userProvider && userProvider._network && userProvider._network.chainId
  }

  const getProviderType = useCallback(() => {
    const providers = web3Modal?.providerController?.providers
    const id = web3Modal?.providerController?.cachedProvider
    return providers.find((item) => item.id === id)?.type
  }, [web3Modal])

  useEffect(() => {
    if (!provider) {
      return
    }
    const chainChanged = chainId => {
      console.log(`chain changed to ${chainId}! updating providers`)
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId)
      setTimeout(() => {
        window.location.reload()
      }, 1)
    }
    const accountsChanged = (accounts) => {
      console.log(`account changed!`, accounts)
      setTimeout(() => {
        window.location.reload()
      }, 1)
    }

    const disconnect = async (code, reason) => {
      console.log("disconnect", code, reason)
      localStorage.removeItem("REACT_APP_NETWORK_TYPE")
      if (getProviderType() !== "injected") {
        await disconnectPassive()
      }
    }
    provider.on("chainChanged", chainChanged)
    provider.on("accountsChanged", accountsChanged)
    provider.on("disconnect", disconnect)

    return () => {
      provider.removeListener("chainChanged", chainChanged)
      provider.removeListener("accountsChanged", accountsChanged)
      provider.removeListener("disconnect", disconnect)
    }
  }, [provider, disconnectPassive, getProviderType])

  useEffect(() => {
    if (!userProvider) {
      return
    }
    userProvider._networkPromise.then(v => {
      setChainId(getChainId(userProvider))
    })
  }, [userProvider])

  return {
    web3Modal,
    provider,
    userProvider,
    connect,
    connectTo,
    requestProvider,
    disconnect,
    disconnectPassive,
    chainId,
    getWalletName: () => getWalletName(web3Modal, userProvider)
  }
}

export default useWallet;
