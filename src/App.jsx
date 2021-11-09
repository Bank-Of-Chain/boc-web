// forgive me ESLint god for I have sinned
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-extend-native */

import React, { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect, HashRouter } from "react-router-dom";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { useUserAddress } from "eth-hooks";
import { useUserProvider, useGasPrice, useBalance } from "./hooks";
import { RPC_URL } from "./constants";
import { Transactor } from "./helpers";
import isEmpty from 'lodash/isEmpty';
import "./App.css";

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
const localProviderUrl = RPC_URL;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
  },
});

function App() {
  const [injectedProvider, setInjectedProvider] = useState();

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

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

  const userProvider = useUserProvider(injectedProvider, localProvider);
  const gasPrice = useGasPrice();
  const tx = Transactor(userProvider, gasPrice);
  const address = useUserAddress(userProvider);

  const yourLocalBalance = useBalance(userProvider, address);
  const nextProps = {
    web3Modal,
    address: yourLocalBalance ? address : '',
    loadWeb3Modal,
    logoutOfWeb3Modal,
    injectedProvider,
    userProvider,
    localProvider,
    tx,
  };

  if (isEmpty(nextProps.address)) return <span />;

  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <Suspense fallback={<div>Loading</div>}>
              <Home {...nextProps} />
            </Suspense>
          </Route>
          <Route path="/invest">
            <Suspense fallback={<div>Loading</div>}>
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
      }, 100);
    }
    window.ethereum.on("chainChanged", chainChangedReload);
    window.ethereum.on("accountsChanged", reload);
  })()

export default App;
