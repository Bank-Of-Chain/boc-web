import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { Switch, Route, Redirect, HashRouter } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import useUserAddress from './hooks/useUserAddress'
import useWallet from './hooks/useWallet'

// === Reducers === //
import { warmDialog } from './reducers/meta-reducer'

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress'
import Backdrop from '@material-ui/core/Backdrop'
import Chains from './components/Chains/Chains'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Frame from './components/Frame/Frame'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

// === Utils === //
import { NET_WORKS, LOCAL_CHAIN_ID } from './constants'
import { makeStyles } from '@material-ui/core/styles'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'

import { WALLETS } from './constants/wallet'
import { isInMobileWalletApp, isInMobileH5, hasWalletInstalled } from './helpers/plugin-util'

// === Styles === //
import './App.css'

const Home = lazy(() => import('./pages/Home/index'))
const InvestNew = lazy(() => import('./pages/InvestNew/index'))
const Ethi = lazy(() => import('./pages/Ethi/index'))
const Team = lazy(() => import('./pages/Team/index'))

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#BBB',
    backgroundColor: 'rgb(19, 24, 35)'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiPaper-root': {
      minWidth: 430,
      minHeight: 120,
      padding: '32px 24px',
      fontSize: 16,
      border: 0,
      color: '#fff',
      boxShadow: '0px 15px 15px rgba(0, 0, 0, 0.05)',
      borderRadius: '20px',
      background: '#292B2E',
      outline: 0
    }
  }
}))

function App() {
  const classes = useStyles()
  const { web3Modal, userProvider, connect, disconnect, chainId, getWalletName } = useWallet()
  const [isLoadingChainId, setIsLoadingChainId] = useState(false)
  const isLoadingTimer = useRef()

  const alertState = useSelector(state => state.metaReducer.warmMsg)
  const dispatch = useDispatch()
  const address = useUserAddress(userProvider)
  const selectedChainId = chainId
  const walletName = getWalletName()

  useEffect(() => {
    if (userProvider) {
      clearTimeout(isLoadingTimer.current)
      isLoadingTimer.current = setTimeout(() => {
        setIsLoadingChainId(true)
      }, 500)
      userProvider._networkPromise.then(() => {
        setIsLoadingChainId(false)
        clearTimeout(isLoadingTimer.current)
      })
    }
  }, [userProvider])

  useEffect(() => {
    if (web3Modal.cachedProvider && !isInMobileWalletApp() && !isInMobileH5()) {
      connect()
    }
  }, [connect, web3Modal.cachedProvider])

  useEffect(() => {
    const isBrowserPluginWallet = [WALLETS.MetaMask.info.symbol].includes(walletName)
    if (!hasWalletInstalled() || !isBrowserPluginWallet) {
      return
    }
    function chainChangedReload(chainId) {
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId)
      reload()
    }
    function reload() {
      setTimeout(() => {
        window.location.reload()
      }, 1)
    }
    window.ethereum.on('chainChanged', chainChangedReload)
    window.ethereum.on('accountsChanged', reload)
    return () => {
      window.ethereum.removeListener('chainChanged', chainChangedReload)
      window.ethereum.removeListener('accountsChanged', reload)
    }
  }, [walletName])

  useEffect(() => {
    if (isUndefined(selectedChainId)) return
    if ((isEmpty(localStorage.REACT_APP_NETWORK_TYPE) && selectedChainId > 0) || `${selectedChainId}` !== localStorage.REACT_APP_NETWORK_TYPE) {
      localStorage.REACT_APP_NETWORK_TYPE = selectedChainId
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }, [selectedChainId])

  const changeNetwork = async targetNetwork => {
    if (isEmpty(targetNetwork)) return
    // If the network of wallet is equal targetNetwork,
    // update localStorage.REACT_APP_NETWORK_TYPE and then reload page.
    if (targetNetwork.chainId === selectedChainId) {
      localStorage.REACT_APP_NETWORK_TYPE = targetNetwork.chainId
      setTimeout(() => {
        window.location.reload()
      }, 1)
      return
    }
    // unlogin and no browser wallet plugin, allow switch tab
    if (!hasWalletInstalled() && !userProvider) {
      return
    }
    const supportSwitch = [WALLETS.MetaMask.info.symbol]
    if (userProvider && !supportSwitch.includes(walletName)) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Switch networks in your wallet, then reconnect'
        })
      )
      return Promise.reject()
    }
    const data = [
      {
        chainId: '0x' + targetNetwork.chainId.toString(16),
        chainName: targetNetwork.name,
        nativeCurrency: targetNetwork.nativeCurrency,
        rpcUrls: [targetNetwork.rpcUrl],
        blockExplorerUrls: [targetNetwork.blockExplorer]
      }
    ]
    console.log('data', data)

    let switchTx
    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
    try {
      // wallet connect does not support change chain, so use window.ethereum, otherwise use userProvider.send
      switchTx = await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: data[0].chainId }]
      })
    } catch (switchError) {
      if (switchError.code === 4001) {
        return Promise.reject()
      }
      // not checking specific error code, because maybe we're not using MetaMask
      try {
        switchTx = await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: data
        })
      } catch (addError) {
        console.log('addError=', addError)
        return Promise.reject()
        // handle "add" error
      }
    }

    if (switchTx) {
      console.log(switchTx)
    }
  }

  const modalJsx = (isOpen, renderText) => {
    return (
      <Modal className={classes.modal} open={isOpen} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3}>{renderText}</Paper>
      </Modal>
    )
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(
      warmDialog({
        ...alertState,
        open: false
      })
    )
  }

  const renderModalValid = () => {
    if (isLoadingChainId) {
      return modalJsx(true, [
        <div key="loading-elm" style={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <p>loading...</p>
        </div>,
        <Chains key="chains-elm" maskStyle={{ textAlign: 'center' }} array={NET_WORKS} handleClick={changeNetwork} />
      ])
    }
    if (!isUndefined(selectedChainId) && !map(NET_WORKS, 'chainId').includes(selectedChainId)) {
      if (selectedChainId === LOCAL_CHAIN_ID) return
      return modalJsx(true, [
        <p key="1" style={{ textAlign: 'center' }}>
          You may need to manually switch network via your wallet.
        </p>,
        <Chains key="3" maskStyle={{ textAlign: 'center', marginTop: 24 }} array={NET_WORKS} handleClick={changeNetwork} />
      ])
    }
  }
  const nextProps = {
    web3Modal,
    address,
    connect,
    disconnect,
    userProvider,
    changeNetwork,
    walletName,
    selectedChainId
  }

  return (
    <div className="App">
      {renderModalValid()}
      <Snackbar
        open={alertState.open}
        autoHideDuration={alertState.timeout}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alertState.type}>{alertState.message}</Alert>
      </Snackbar>
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color="inherit" />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Home {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route path="/usdi">
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color="inherit" />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <InvestNew {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route path="/ethi">
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color="inherit" />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Ethi {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route exact path="/team">
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color="inherit" />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Team {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route path="*">
            <Redirect
              to={{
                pathname: '/'
              }}
            />
          </Route>
        </Switch>
      </HashRouter>
    </div>
  )
}

export default App
