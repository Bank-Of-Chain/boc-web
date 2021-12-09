/* eslint-disable no-extend-native */
import React, { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect, HashRouter } from "react-router-dom";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Chains from "./components/Chains/Chains";
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';

// === Utils === //
import { useGasPrice, useBalance } from "./hooks";
import { RPC_URL, USDT_ADDRESS, NET_WORKS, VAULT_ADDRESS } from "./constants";
import { Transactor } from "./helpers";
import { makeStyles } from '@material-ui/core/styles';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import { lendSwap } from 'piggy-finance-utils';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

// === Styles === //
import "./App.css";
const { ethers } = require("ethers");

lendSwap.setUnderlying(USDT_ADDRESS);
Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

const Home = lazy(() => import('./pages/Home/index'));
const Invest = lazy(() => import('./pages/Invest/index'));

const DEBUG = false;

// 🏠 Your local provider is usually pointed at your local blockchain
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
if (DEBUG) console.log("🏠 Connecting to provider:", RPC_URL);
const localProvider = RPC_URL && new JsonRpcProvider(RPC_URL);
const web3Modal = new SafeAppWeb3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
  },
});


const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#BBB',
    backgroundColor: 'rgb(19, 24, 35)'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

function App() {

  const classes = useStyles();
  const [userProvider, setUserProvider] = useState();
  const [localChainId, setChainId] = useState();
  const [isLoadingChainId, setIsLoadingChainId] = useState(false);
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.requestProvider();
    const library = new Web3Provider(provider);
    setUserProvider(library);
    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId);
      setUserProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setUserProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log('disconnect', code, reason);
    });
  }, [setUserProvider]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  useEffect(() => {
    if(localProvider && localProvider._networkPromise) {
      setIsLoadingChainId(true);
      localProvider._networkPromise.then((v) => {
        setTimeout(() => {
          setChainId(v.chainId)
          setIsLoadingChainId(false)
        }, 300);
      })
    }
  }, []);

  const gasPrice = useGasPrice();
  const tx = Transactor(userProvider, gasPrice);
  const address = useUserAddress(userProvider);
  const balance = useBalance(userProvider, address);

  const changeNetwork = async (targetNetwork) => {
    const ethereum = window.ethereum;
    const data = [
      {
        chainId: "0x" + targetNetwork.chainId.toString(16),
        chainName: targetNetwork.name,
        nativeCurrency: targetNetwork.nativeCurrency,
        rpcUrls: [targetNetwork.rpcUrl],
        blockExplorerUrls: [targetNetwork.blockExplorer],
      },
    ];
    console.log("data", data);

    let switchTx;
    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
    try {
      switchTx = await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: data[0].chainId }],
      });
    } catch (switchError) {
      // not checking specific error code, because maybe we're not using MetaMask
      try {
        switchTx = await ethereum.request({
          method: "wallet_addEthereumChain",
          params: data,
        });
      } catch (addError) {
        console.log('addError=', addError)
        // handle "add" error
      }
    }

    if (switchTx) {
      console.log(switchTx);
    }
  }
  const nextProps = {
    web3Modal,
    address,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    userProvider,
    localProvider,
    tx,
    balance,
    localChainId,
    changeNetwork
  };
  return (
    <div className="App">
      <Modal
        className={classes.modal}
        open={isEmpty(VAULT_ADDRESS) || isUndefined(localChainId)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper elevation={3} style={{ 
            padding: 20, minWidth: 430, minHeight: 120, 
            color: 'rgba(255,255,255, 0.87)',
            border: '1px solid',
            background: '#000' }}>
          { 
            isLoadingChainId 
              ? <div style={{ textAlign:'center' }}>
                  <CircularProgress color="inherit" />
                  <p>钱包数据加载中...</p>
                </div>
              : <p>您当前的网络暂不支持或无法识别，请重新设置您的网络！</p>
          }
          <Chains array={NET_WORKS} handleClick={changeNetwork} />
        </Paper>
      </Modal>
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <Suspense fallback={<Backdrop className={classes.backdrop} open>
              <CircularProgress color="inherit" />
            </Backdrop>}>
              <Home {...nextProps} />
            </Suspense>
          </Route>
          <Route path="/invest">
            <Suspense fallback={<Backdrop className={classes.backdrop} open>
              <CircularProgress color="inherit" />
            </Backdrop>}>
              <Invest {...nextProps} />
            </Suspense>
          </Route>
          <Route path="*">
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          </Route>
        </Switch>
      </HashRouter>
    </div>
  );
}

// eslint-disable-next-line no-unused-expressions
window.ethereum &&
  (() => {
    function chainChangedReload(chainId) {
      localStorage.REACT_APP_NETWORK_TYPE = parseInt(chainId);
      reload();
    }
    function reload() {
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
    window.ethereum.on("chainChanged", chainChangedReload);
    window.ethereum.on("accountsChanged", reload);
  })()

export default App;
