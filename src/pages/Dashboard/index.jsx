import React, { useEffect, useState } from "react";
import { Row, Col, Divider } from "antd";
import map from "lodash/map";
import { Redirect } from "react-router-dom";
import { JsonRpcProvider } from "@ethersproject/providers";
import Transaction from "../../components/Transaction";
import UserBoard from "../../components/UserBoard";

import { INFURA_ID, NETWORKS } from "../../constants";

import products from "./products";

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    📡 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

export default function Dashboard(props) {
  const { address, writeContracts, logoutOfWeb3Modal, web3Modal, userProvider, localProvider, tx, readContracts } = props;

  const [, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  if (!web3Modal.cachedProvider) {
    return (
      <Redirect
        to={{
          pathname: "/",
        }}
      />
    );
  }

  return (
    <Row>
      <Col span={24}>
        {
          address && <UserBoard address={address} readContracts={readContracts} localProvider={localProvider} userProvider={userProvider} writeContracts={writeContracts} blockExplorer={blockExplorer} mainnetProvider={mainnetProvider} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        }
        <Divider />
      </Col>
      <Col span="24">
        <Row key={1} style={{ padding: 20 }}>
          {map(products, item => {
            return (
              address && (
                <Col span={24} key={item.name}>
                  <Transaction
                    {...item}
                    address={address}
                    readContracts={readContracts}
                    writeContracts={writeContracts}
                    userProvider={userProvider}
                    localProvider={localProvider}
                    tx={tx}
                  />
                </Col>
              )
            );
          })}
        </Row>
      </Col>
    </Row>
  );
}
