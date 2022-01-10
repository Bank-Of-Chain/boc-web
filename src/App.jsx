/* eslint-disable no-extend-native */
import React, { useState, useCallback, useEffect, Suspense, lazy } from "react"
import { Switch, Route, Redirect, HashRouter } from "react-router-dom"
import { Web3Provider } from "@ethersproject/providers"
import { useUserAddress } from "eth-hooks"

// === Components === //
import CircularProgress from "@material-ui/core/CircularProgress"
import Backdrop from "@material-ui/core/Backdrop"
import Chains from "./components/Chains/Chains"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"

// === Utils === //
import { USDT_ADDRESS, NET_WORKS, VAULT_ADDRESS } from "./constants"
import { makeStyles } from "@material-ui/core/styles"
import { SafeAppWeb3Modal } from "@gnosis.pm/safe-apps-web3modal"
import { lendSwap } from "piggy-finance-utils"
import isEmpty from "lodash/isEmpty"
import isUndefined from "lodash/isUndefined"

// === Styles === //
import "./App.css"

try {
  lendSwap.setUnderlying(USDT_ADDRESS)
} catch (error) {
  console.error(error)
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
const Invest = lazy(() => import("./pages/Invest/index"))
const Index = lazy(() => import("./pages/Index/index"))

const web3Modal = new SafeAppWeb3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {},
})

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
  const [userProvider, setUserProvider] = useState()
  const [localChainId, setChainId] = useState()
  const [isLoadingChainId, setIsLoadingChainId] = useState(false)
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.requestProvider()

    const tututu = p => {
      setIsLoadingChainId(true)
      setUserProvider(p)
      p._networkPromise.then(v => {
        setTimeout(() => {
          setChainId(v.chainId)
          setIsLoadingChainId(false)
        }, 2000)
      })
    }

    tututu(new Web3Provider(provider))
    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`)
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId)
      tututu(new Web3Provider(provider))
    })

    provider.on("accountsChanged", () => {
      console.log(`account changed!`)
      tututu(new Web3Provider(provider))
    })

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log("disconnect", code, reason)
      localStorage.REACT_APP_NETWORK_TYPE = ""
    })
  }, [setUserProvider])

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider()
    setTimeout(() => {
      window.location.reload()
    }, 1)
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, [loadWeb3Modal])

  const address = useUserAddress(userProvider)
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId

  useEffect(() => {
    if (isEmpty(localStorage.REACT_APP_NETWORK_TYPE) && selectedChainId > 0) {
      localStorage.REACT_APP_NETWORK_TYPE = selectedChainId
      setTimeout(() => {
        window.location.reload()
      }, 1)
    }
  }, [selectedChainId])
  const changeNetwork = async targetNetwork => {
    if (isEmpty(targetNetwork)) return
    // 如果metamask已经使用的是targetNetwork的话，则修改localStorage.REACT_APP_NETWORK_TYPE之后，进行页面刷新。
    if (targetNetwork.chainId === selectedChainId) {
      localStorage.REACT_APP_NETWORK_TYPE = targetNetwork.chainId
      setTimeout(() => {
        window.location.reload()
      }, 1)
      return
    }
    const ethereum = window.ethereum
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
      switchTx = await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: data[0].chainId }],
      })
    } catch (switchError) {
      // not checking specific error code, because maybe we're not using MetaMask
      try {
        switchTx = await ethereum.request({
          method: "wallet_addEthereumChain",
          params: data,
        })
      } catch (addError) {
        console.log("addError=", addError)
        // handle "add" error
      }
    }

    if (switchTx) {
      console.log(switchTx)
    }
  }
  const nextProps = {
    web3Modal,
    address,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    userProvider,
    changeNetwork,
  }

  console.log("nextProps=", nextProps)
  return (
    <div className='App'>
      <Modal
        className={classes.modal}
        open={isEmpty(VAULT_ADDRESS) || isUndefined(localChainId)}
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
          {isLoadingChainId ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress color='inherit' />
              <p>钱包数据加载中...</p>
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>您当前的网络暂不支持，请重新设置您的网络！</p>
          )}
          <Chains array={NET_WORKS} handleClick={changeNetwork} />
        </Paper>
      </Modal>
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
              <Home {...nextProps} />
            </Suspense>
          </Route>
          <Route path='/invest'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Invest {...nextProps} />
            </Suspense>
          </Route>
          <Route path='/index'>
            <Suspense
              fallback={
                <Backdrop className={classes.backdrop} open>
                  <CircularProgress color='inherit' />
                </Backdrop>
              }
            >
              <Index {...nextProps} />
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

// eslint-disable-next-line no-unused-expressions
window.ethereum &&
  (() => {
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
  })()

export default App
