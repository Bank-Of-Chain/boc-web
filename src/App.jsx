/* eslint-disable no-extend-native */
import React, { useState, useCallback, useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect, HashRouter } from "react-router-dom";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';

// === Utils === //
import { useGasPrice, useBalance } from "./hooks";
import { RPC_URL, USDT_ADDRESS } from "./constants";
import { Transactor } from "./helpers";
import { makeStyles } from '@material-ui/core/styles';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import { lendSwap } from 'piggy-finance-utils';

// === Styles === //
import "./App.css";

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
const localProvider = new JsonRpcProvider(RPC_URL);
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
}));

function App() {

  const classes = useStyles();
  const [userProvider, setUserProvider] = useState();

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.requestProvider();
    const library = new Web3Provider(provider);
    setUserProvider(library);
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

  const gasPrice = useGasPrice();
  const tx = Transactor(userProvider, gasPrice);
  const address = useUserAddress(userProvider);

  const balance = useBalance(userProvider, address);
  const nextProps = {
    web3Modal,
    address,
    loadWeb3Modal,
    logoutOfWeb3Modal,
    userProvider,
    localProvider,
    tx,
    balance
  };

  return (
    <div className="App">
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
      }, 100);
    }
    window.ethereum.on("chainChanged", chainChangedReload);
    window.ethereum.on("accountsChanged", reload);
  })()

export default App;
