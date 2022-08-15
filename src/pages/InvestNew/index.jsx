import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";

// === Components === //
import Card from "@material-ui/core/Card";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import Tooltip from "@material-ui/core/Tooltip";
import InfoIcon from "@material-ui/icons/Info";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import UndoIcon from "@material-ui/icons/Undo";
import Loading from "@/components/LoadingComponent";
import GridItem from "@/components/Grid/GridItem";
import GridContainer from "@/components/Grid/GridContainer";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

// === Reducers === //
import { useDispatch, useSelector } from "react-redux";
import { warmDialog } from "@/reducers/meta-reducer";
import { setCurrentTab } from "@/reducers/invest-reducer";

// === constants === //
import {
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
  NET_WORKS,
  CHAIN_ID,
  IERC20_ABI,
} from "@/constants";
import { INVEST_TAB } from "@/constants/invest";

// === Utils === //
import { formatBalance } from "@/helpers/number-format";
import moment from "moment";
import isEmpty from "lodash/isEmpty";
import last from "lodash/last";
import noop from "lodash/noop";
import * as ethers from "ethers";
import useVersionWapper from "@/hooks/useVersionWapper";
import { addToken } from "@/helpers/wallet";
import { getLastPossibleRebaseTime } from "@/helpers/time-util";
import useVault from "@/hooks/useVault";

// === Styles === //
import styles from "./style";

const useStyles = makeStyles(styles);
const { BigNumber } = ethers;

function Invest(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const isLayoutSm = useMediaQuery("(max-width: 960px)");

  const {
    address,
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI,
    USDI_ADDRESS,
    EXCHANGE_AGGREGATOR_ABI,
    EXCHANGE_ADAPTER_ABI,
    VAULT_BUFFER_ADDRESS,
    VAULT_BUFFER_ABI,
    abi_version,
  } = props;
  const [usdtBalance, setUsdtBalance] = useState(BigNumber.from(0));
  const [usdtDecimals, setUsdtDecimals] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(BigNumber.from(0));
  const [usdcDecimals, setUsdcDecimals] = useState(0);
  const [daiBalance, setDaiBalance] = useState(BigNumber.from(0));
  const [daiDecimals, setDaiDecimals] = useState(0);
  const [usdiDecimals, setUsdiDecimals] = useState(0);

  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [beforeTotalValue, setBeforeTotalValue] = useState(BigNumber.from(0));
  const [totalValue, setTotalValue] = useState(BigNumber.from(0));

  const [vaultBufferBalance, setVaultBufferBalance] = useState(
    BigNumber.from(0)
  );
  const [vaultBufferDecimals, setVaultBufferDecimals] = useState(0);

  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const current = useSelector((state) => state.investReducer.currentTab);
  const setCurrent = (tab) => {
    loadCoinsBalance();
    dispatch(setCurrentTab(tab));
  };

  const lastRebaseTime = getLastPossibleRebaseTime();

  const { minimumInvestmentAmount } = useVault(
    VAULT_ADDRESS,
    VAULT_ABI,
    userProvider
  );

  // load user balance
  const loadBalance = () => {
    if (isEmpty(address)) return;
    const usdtContract = new ethers.Contract(
      USDT_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const daiContract = new ethers.Contract(
      DAI_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const usdiContract = new ethers.Contract(
      USDI_ADDRESS,
      IERC20_ABI,
      userProvider
    );

    // 如果abi版本等于beta-v1.5.9，则需要多查询vaultBuffer的账户余额
    const vaultBufferContract = new ethers.Contract(
      VAULT_BUFFER_ADDRESS,
      VAULT_BUFFER_ABI,
      userProvider
    );
    vaultBufferContract
      .decimals()
      .then(setVaultBufferDecimals)
      .catch(() => setVaultBufferDecimals(1));

    Promise.all([
      loadCoinsBalance(),
      loadTotalAssets()
        .then((afterTotalValue) => {
          setTotalValue(afterTotalValue);
        })
        .catch(noop),
      usdtContract.decimals().then(setUsdtDecimals),
      usdcContract.decimals().then(setUsdcDecimals),
      daiContract.decimals().then(setDaiDecimals),
      usdiContract
        .decimals()
        .then(setUsdiDecimals)
        .catch(() => setUsdiDecimals(1)),
    ]).catch(() => {
      dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please confirm wallet's network!",
        })
      );
    });
  };

  /**
   * only load balance
   * @returns
   */
  const loadCoinsBalance = () => {
    if (isEmpty(address)) return;
    setIsBalanceLoading(true);
    const usdtContract = new ethers.Contract(
      USDT_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const daiContract = new ethers.Contract(
      DAI_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const usdiContract = new ethers.Contract(
      USDI_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    const vaultBufferContract = new ethers.Contract(
      VAULT_BUFFER_ADDRESS,
      VAULT_BUFFER_ABI,
      userProvider
    );
    return Promise.all([
      usdiContract.balanceOf(address).catch(() => BigNumber.from(0)),
      usdtContract.balanceOf(address),
      usdcContract.balanceOf(address),
      daiContract.balanceOf(address),
      vaultBufferContract.balanceOf(address).catch(() => BigNumber.from(0)),
    ])
      .then(
        ([
          usdiBalance,
          usdtBalance,
          usdcBalance,
          daiBalance,
          vaultBufferBalance,
        ]) => {
          setToBalance(usdiBalance);
          setUsdtBalance(usdtBalance);
          setUsdcBalance(usdcBalance);
          setDaiBalance(daiBalance);
          setVaultBufferBalance(vaultBufferBalance);
          return [
            usdiBalance,
            usdtBalance,
            usdcBalance,
            daiBalance,
            vaultBufferBalance,
          ];
        }
      )
      .finally(() => {
        setTimeout(() => {
          setIsBalanceLoading(false);
        }, 1000);
      });
  };

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return;
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then((afterTotalValue) => {
          if (!afterTotalValue.eq(beforeTotalValue)) {
            setBeforeTotalValue(totalValue);
            setTotalValue(afterTotalValue);
          }
        })
        .catch(noop);
    const timer = setInterval(loadTotalAssetsFn, 3000);
    return () => clearInterval(timer);
  }, [totalValue.toString()]);

  function handleMint(...eventArgs) {
    console.log("Mint=", eventArgs);
    const block = last(eventArgs);
    block &&
      block
        .getTransaction()
        .then((tx) => tx.wait())
        .then(loadBalance);
  }
  function handleBurn(...eventArgs) {
    console.log("Burn=", eventArgs);
    const block = last(eventArgs);
    block &&
      block
        .getTransaction()
        .then((tx) => tx.wait())
        .then(loadBalance);
  }

  useEffect(() => {
    const listener = () => {
      if (isEmpty(VAULT_ABI) || isEmpty(userProvider)) return;
      loadBalance();
      if (isEmpty(VAULT_ADDRESS)) return;
      const vaultContract = new ethers.Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        userProvider
      );
      if (!isEmpty(address)) {
        vaultContract.on("Mint", handleMint);
        vaultContract.on("Burn", handleBurn);
        return () => {
          vaultContract.off("Mint", handleMint);
          vaultContract.off("Burn", handleBurn);
        };
      }
    };
    return listener();
  }, [address, VAULT_ADDRESS, VAULT_ABI, userProvider]);

  const loadTotalAssets = () => {
    if (abi_version === "beta-v1.5.9") {
      const vaultContract = new ethers.Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        userProvider
      );
      return vaultContract.totalAssetsIncludeVaultBuffer();
    }
    const usdiContract = new ethers.Contract(
      USDI_ADDRESS,
      IERC20_ABI,
      userProvider
    );
    return usdiContract.totalSupply();
  };

  const handleAddUSDi = () => {
    addToken(USDI_ADDRESS, "USDi", usdiDecimals);
  };

  const changeRouter = (path) => {
    let promise = Promise.resolve({});
    if (path === "#/ethi" && CHAIN_ID !== 1) {
      promise = props.changeNetwork(NET_WORKS[0]);
    }
    promise.then(() => {
      history.push(path.slice(1));
    });
  };
  return (
    <div className={classes.container}>
      <GridContainer spacing={0} style={{ paddingTop: "100px" }}>
        <GridItem xs={2} sm={2} md={3} style={{ padding: "0 2rem" }}>
          <List>
            <ListItem
              key="My Account"
              button
              className={classNames(classes.item)}
              onClick={() => setCurrent(INVEST_TAB.account)}
            >
              <ListItemIcon>
                <AccountBalanceWalletIcon
                  style={{ color: current === 0 ? "#A68EFE" : "#fff" }}
                />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText
                  primary={"My Account"}
                  className={classNames(
                    current === 0 ? classes.check : classes.text
                  )}
                />
              )}
            </ListItem>
            <ListItem
              key="Deposit"
              button
              className={classNames(
                classes.item,
                current === 1 && classes.check
              )}
              onClick={() => setCurrent(INVEST_TAB.deposit)}
            >
              <ListItemIcon>
                <SaveAltIcon
                  style={{ color: current === 1 ? "#A68EFE" : "#fff" }}
                />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText
                  primary={"Deposit"}
                  className={classNames(
                    current === 1 ? classes.check : classes.text
                  )}
                />
              )}
            </ListItem>
            <ListItem
              key="Withdraw"
              button
              className={classNames(
                classes.item,
                current === 2 && classes.check
              )}
              onClick={() => setCurrent(INVEST_TAB.withdraw)}
            >
              <ListItemIcon>
                <UndoIcon
                  style={{ color: current === 2 ? "#A68EFE" : "#fff" }}
                />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText
                  primary={"Withdraw"}
                  className={classNames(
                    current === 2 ? classes.check : classes.text
                  )}
                />
              )}
            </ListItem>
            <ListItem
              key="Switch to ETHi"
              button
              className={classNames(classes.item, classes.check)}
              onClick={() => changeRouter("#/ethi")}
            >
              <ListItemIcon>
                <SwapHorizIcon style={{ color: "#fff" }} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText
                  primary={"Switch to ETHi"}
                  className={classNames(classes.text)}
                />
              )}
            </ListItem>
          </List>
        </GridItem>
        <GridItem xs={9} sm={9} md={6}>
          {current === 0 && (
            <Card className={classes.balanceCard}>
              <div className={classes.balanceCardItem}>
                <div className={classes.balanceCardValue}>
                  <span
                    title={formatBalance(toBalance, usdiDecimals, {
                      showAll: true,
                    })}
                  >
                    <Loading loading={isBalanceLoading}>
                      {formatBalance(toBalance, usdiDecimals)}
                    </Loading>
                  </span>
                  <span className={classes.symbol}>USDi</span>
                  {userProvider && (
                    <span title="Add token address to wallet">
                      <AddCircleOutlineIcon
                        className={classes.addTokenIcon}
                        onClick={handleAddUSDi}
                        fontSize="small"
                      />
                    </span>
                  )}
                </div>
                {abi_version === "beta-v1.5.9" && (
                  <div
                    className={classes.balanceCardValue}
                    style={{ fontSize: "1rem" }}
                  >
                    <span
                      title={formatBalance(
                        vaultBufferBalance,
                        vaultBufferDecimals,
                        { showAll: true }
                      )}
                    >
                      <Loading loading={isBalanceLoading}>
                        {formatBalance(vaultBufferBalance, vaultBufferDecimals)}
                      </Loading>
                    </span>
                    <span className={classes.symbol}>
                      USDi Ticket&nbsp;&nbsp;
                    </span>
                    <Tooltip
                      classes={{
                        tooltip: classes.tooltip,
                      }}
                      placement="right"
                      title={
                        <span>
                          The USDi ticket is automatically converted to USDi.
                          And was last executed in&nbsp;
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            {moment(lastRebaseTime).format("yyyy-MM-DD HH:mm")}
                          </span>
                        </span>
                      }
                    >
                      <InfoIcon style={{ fontSize: "1rem" }} />
                    </Tooltip>
                  </div>
                )}
                <div className={classes.balanceCardLabel}>
                  AVAILABLE BALANCE
                </div>
              </div>
              {/* <div className={classes.tokenInfo}>
                {userProvider && (
                  <a href={`${net.blockExplorer}/address/${USDI_ADDRESS}`} target='_blank' rel='noopener noreferrer'>
                    <img className={classes.scanToken} src={net.blockExplorerIcon} alt='wallet' />
                  </a>
                )}
              </div> */}
            </Card>
          )}
          {current === 1 && (
            <div
              className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}
            >
              <Deposit
                address={address}
                usdtBalance={usdtBalance}
                usdtDecimals={usdtDecimals}
                usdcBalance={usdcBalance}
                usdcDecimals={usdcDecimals}
                daiBalance={daiBalance}
                daiDecimals={daiDecimals}
                usdiDecimals={usdiDecimals}
                userProvider={userProvider}
                VAULT_ABI={VAULT_ABI}
                IERC20_ABI={IERC20_ABI}
                VAULT_ADDRESS={VAULT_ADDRESS}
                abi_version={abi_version}
                toBalance={toBalance}
                vaultBufferBalance={vaultBufferBalance}
                vaultBufferDecimals={vaultBufferDecimals}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadCoinsBalance}
                minimumInvestmentAmount={minimumInvestmentAmount}
              />
            </div>
          )}
          {current === 2 && (
            <div
              className={isLayoutSm ? classes.wrapperMobile : classes.wrapper}
            >
              <Withdraw
                toBalance={toBalance}
                usdiDecimals={usdiDecimals}
                userProvider={userProvider}
                VAULT_ADDRESS={VAULT_ADDRESS}
                VAULT_ABI={VAULT_ABI}
                IERC20_ABI={IERC20_ABI}
                EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
                EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
                isBalanceLoading={isBalanceLoading}
                reloadBalance={loadCoinsBalance}
              />
            </div>
          )}
        </GridItem>
      </GridContainer>
    </div>
  );
}

export default useVersionWapper(Invest, "mutilCoins");
