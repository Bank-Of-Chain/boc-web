/* eslint-disable no-extend-native */
import React, { useState, useEffect, Suspense, lazy } from "react"
import { Switch, Route, Redirect, HashRouter } from "react-router-dom"
import { useUserAddress } from "eth-hooks"
import { useSelector, useDispatch } from "react-redux"
import useWallet from "./hooks/useWallet"

// === Reducers === //
import { warmDialog } from "./reducers/meta-reducer"

// === Components === //
import CircularProgress from "@material-ui/core/CircularProgress"
import Backdrop from "@material-ui/core/Backdrop"
import Chains from "./components/Chains/Chains"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import Frame from "./components/Frame/Frame"
import Snackbar from "@material-ui/core/Snackbar"
import Alert from "@material-ui/lab/Alert"

// === Utils === //
import { USDT_ADDRESS, NET_WORKS, LOCAL_CHAIN_ID } from "./constants"
import { makeStyles } from "@material-ui/core/styles"
import { lendSwap } from "piggy-finance-utils"
import isEmpty from "lodash/isEmpty"
import isUndefined from "lodash/isUndefined"
import map from "lodash/map"

import { WALLETS } from "./constants/wallet"
import { isInMobileWalletApp, isInMobileH5 } from "./helpers/plugin-util"

// === Styles === //
import "./App.css"

try {
  lendSwap.setUnderlying(USDT_ADDRESS)
} catch (error) {
  console.warn(`*** ${error.message} ***`)
}
Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
  return fmt
}

const Home = lazy(() => import("./pages/Home/index"))
// const Invest = lazy(() => import("./pages/Invest/index"))
const InvestNew = lazy(() => import("./pages/InvestNew/index"))
const Ethi = lazy(() => import("./pages/Ethi/index"))

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#BBB",
    backgroundColor: "rgb(19, 24, 35)",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}))

function App () {
  const classes = useStyles()
  const {
    web3Modal,
    userProvider,
    connect,
    disconnect,
    getChainId,
    getWalletName
  } = useWallet()
  const [isLoadingChainId, setIsLoadingChainId] = useState(false)

  const alertState = useSelector(state => state.metaReducer.warmMsg)
  const dispatch = useDispatch()
  const address = useUserAddress(userProvider)
  const selectedChainId = getChainId(userProvider)
  const walletName = getWalletName()

  useEffect(() => {
    if (userProvider) {
      setIsLoadingChainId(true)
      userProvider._networkPromise.then(v => {
        setTimeout(() => {
          setIsLoadingChainId(false)
        }, 200)
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
    if (!window.ethereum || !isBrowserPluginWallet) {
      return
    }
    function chainChangedReload (chainId) {
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId)
      reload()
    }
    function reload () {
      setTimeout(() => {
        window.location.reload()
      }, 1)
    }
    window.ethereum.on("chainChanged", chainChangedReload)
    window.ethereum.on("accountsChanged", reload)
    return () => {
      window.ethereum.removeListener("chainChanged", chainChangedReload)
      window.ethereum.removeListener("accountsChanged", reload)
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

  const changeNetwork = targetNetwork => {
    return new Promise(async (resolver, reject) => {
      if (isEmpty(targetNetwork)) return
      // 如果metamask已经使用的是targetNetwork的话，则修改localStorage.REACT_APP_NETWORK_TYPE之后，进行页面刷新。
      if (targetNetwork.chainId === selectedChainId) {
        localStorage.REACT_APP_NETWORK_TYPE = targetNetwork.chainId
        setTimeout(() => {
          window.location.reload()
        }, 1)
        return
      }
      // unlogin and no browser wallet plugin, allow switch tab
      if (!window.ethereum && !userProvider) {
        resolver()
        return
      }
      const supportSwitch = [WALLETS.MetaMask.info.symbol]
      if (userProvider && !supportSwitch.includes(walletName)) {
        dispatch(
          warmDialog({
            open: true,
            type: "warning",
            message: "Switch networks in your wallet, then reconnect",
          })
        )
        reject()
        return
      }
      const data = [
        {
          chainId: "0x" + targetNetwork.chainId.toString(16),
          chainName: targetNetwork.name,
          nativeCurrency: targetNetwork.nativeCurrency,
          rpcUrls: [targetNetwork.rpcUrl],
          blockExplorerUrls: [targetNetwork.blockExplorer],
        },
      ]
      console.log("data", data)

      let switchTx
      // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
      try {
        // wallet connect does not support change chain, so use window.ethereum, otherwise use userProvider.send
        switchTx = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: data[0].chainId }],
        })
      } catch (switchError) {
        if (switchError.code === 4001) {
          reject()
        }
        // not checking specific error code, because maybe we're not using MetaMask
        try {
          switchTx = await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: data,
          })
        } catch (addError) {
          console.log("addError=", addError)
          reject()
          // handle "add" error
        }
      }

      if (switchTx) {
        console.log(switchTx)
      }
      resolver()
    })
  }

  const modalJsx = (isOpen, renderText) => {
    return (
      <Modal
        className={classes.modal}
        open={isOpen}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          style={{
            padding: 20,
            minWidth: 430,
            minHeight: 120,
            color: "rgba(255,255,255, 0.87)",
            border: "1px solid",
            background: "#000",
          }}
        >
          {renderText}
        </Paper>
      </Modal>
    )
  }
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    dispatch(
      warmDialog({
        ...alertState,
        open: false,
      }),
    )
  }

  const renderModalValid = () => {
    if (isLoadingChainId) {
      return modalJsx(true, [
        <div key='1' style={{ textAlign: "center" }}>
          <CircularProgress color='inherit' />
          <p>loading...</p>
        </div>,
        <Chains key='2' maskStyle={{ textAlign: "center" }} array={NET_WORKS} handleClick={changeNetwork} />,
      ])
    }
    if (!isUndefined(selectedChainId) && !map(NET_WORKS, "chainId").includes(selectedChainId)) {
      if (selectedChainId === LOCAL_CHAIN_ID) return
      return modalJsx(true, [
        <p key='1' style={{ textAlign: "center" }}>
          You may need to manually switch network via your wallet.
        </p>,
        <Chains key='3' maskStyle={{ textAlign: "center" }} array={NET_WORKS} handleClick={changeNetwork} />,
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
    selectedChainId,
  }

  return (
    <div className='App'>
      {renderModalValid()}
      <Snackbar
        open={alertState.open}
        autoHideDuration={alertState.timeout}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alertState.type}>{alertState.message}</Alert>
      </Snackbar>
      <HashRouter>
        <Switch>
          <Route exact path='/'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Home {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          {/* <Route path='/invest'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Invest {...nextProps} />
              </Frame>
            </Suspense>
          </Route> */}
          <Route path='/mutils'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <InvestNew {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route path='/ethi'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Frame {...nextProps}>
                <Ethi {...nextProps} />
              </Frame>
            </Suspense>
          </Route>
          <Route path='*'>
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          </Route>
        </Switch>
      </HashRouter>
    </div>
  )
}

export default App
