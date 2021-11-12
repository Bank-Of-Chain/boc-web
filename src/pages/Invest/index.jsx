import React, { useState, useEffect } from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
// core components
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Parallax from "../../components/Parallax/Parallax";
// sections for this page
import HeaderLinks from "../../components/Header/HeaderLinks";
import CustomTabs from "../../components/CustomTabs/CustomTabs";
import CustomInput from "../../components/CustomInput/CustomInput";
import Button from "../../components/CustomButtons/Button";
import Muted from "../../components/Typography/Muted";
import CountTo from 'react-count-to';
import Tooltip from "@material-ui/core/Tooltip";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from '@material-ui/lab/Alert';

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, IERC20_ABI, USDT_ADDRESS, EXCHANGE_AGGREGATOR_ABI, EXCHANGE_EXTRA_PARAMS, MULTIPLE_OF_GAS } from "../../constants";

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils";
import { toFixed } from "../../helpers/number-format";
import { getTime } from "../../helpers/time-format";
import map from "lodash/map";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import isUndefined from "lodash/isUndefined";
import noop from "lodash/noop";
import * as ethers from "ethers";

import styles from "./style";

const useStyles = makeStyles(styles);
const { BigNumber } = ethers;

// 获取兑换路径时，支持的最大损失
const slipper = 5000;

const getExchangePlatformAdapters = async (exchangeAggregator) => {
  const adapters = await exchangeAggregator.getExchangeAdapters();
  const exchangePlatformAdapters = {};
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i];
  }
  return exchangePlatformAdapters;
}

export default function Invest(props) {
  const classes = useStyles();
  const { address, userProvider } = props;
  const usdtDecimals = BigNumber.from(1e6);
  const [beforeTotalAssets, setBeforeTotalAssets] = useState(BigNumber.from(0));
  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0));

  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1));

  const [lastDepositTimes, setLastDepositTimes] = useState(BigNumber.from(0));
  const [withdrawFee, setWithdrawFee] = useState(BigNumber.from(0));
  const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState(0);

  const [allowMaxLoss, setAllowMaxLoss] = useState('0.6');
  const [shouldExchange, setShouldExchange] = useState(true);
  // 模态框标识位
  const [alertState, setAlertState] = useState({
    open: false,
    type: '',
    message: ''
  });
  const [trackedAssets, setTrackedAssets] = useState([]);
  const [token, setToken] = useState('');

  const dealLine = BigNumber.from(60 * 60 * 24 - 1).sub(currentBlockTimestamp - lastDepositTimes);

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance;
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);

    Promise.all([
      usdtContract.balanceOf(address).then(setFromBalance),
      vaultContract.balanceOf(address).then(setToBalance).catch(console.error),
      vaultContract.pricePerShare().then(setPerFullShare).catch(console.error),
      vaultContract.userInfos(address).then(setLastDepositTimes),
      vaultContract.calculateWithdrawFeePercent(address).then(setWithdrawFee),
      userProvider.getBlock(userProvider.blockNumber).then(resp => {
        setCurrentBlockTimestamp(resp.timestamp);
      }),
      vaultContract.token().then(setToken),
      vaultContract.getTrackedAssets().then(setTrackedAssets)
    ]).catch(() => {
      setAlertState({
        open: true,
        type: 'warning',
        message: '请确认MetaMask的当前网络！'
      })
    })
  };

  /**
   * 校验fromValue是否为有效输入
   * @returns 
   */
  const isValidFromValue = () => {
    if (fromValue === '' || fromValue === '-') return;
    if (fromValue < 0) return false;
    if (fromBalance.lt(usdtDecimals.mul(fromValue))) return false;
    return true;
  }

  /**
   * 校验toValue是否为有效输入
   * @returns 
   */
  const isValidToValue = () => {
    if (toValue === '' || toValue === '-') return;
    if (toValue < 0) return false;
    if (toBalance.lt(usdtDecimals.mul(toValue))) return false;
    return true;
  }

  /**
   * 校验allow loss是否为有效输入
   * @returns 
   */
  const isValidAllowLoss = () => {
    if (allowMaxLoss === '') return;
    if (isNaN(allowMaxLoss)) return false;
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false;
    return true;
  }

  const diposit = async () => {
    // 如果输入的数字不合法，弹出提示框
    if (!isValidFromValue()) {
      return setAlertState({
        open: true,
        type: 'warning',
        message: '请输入正确的数值'
      })
    }
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const usdtContractWithUser = usdtContract.connect(signer);
    const nVaultWithUser = vaultContract.connect(signer);
    let nextValue = BigNumber.from(fromValue * usdtDecimals);
    try {
      // 获取当前允许的额度
      const allowanceAmount = await usdtContractWithUser.allowance(address, VAULT_ADDRESS);
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextValue.gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0);
          await firstApproveTx.wait();
        }
        console.log('当前授权：', allowanceAmount.toString(), '准备授权：', nextValue.toString());
        const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue);
        await secondApproveTx.wait();
      }
      const depositTx = await nVaultWithUser.deposit(nextValue);
      await depositTx.wait();
      setFromValue(0);
      setAlertState({
        open: true,
        type: 'success',
        message: '数据提交成功'
      })
    } catch (error) {
      console.log('error=', error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          setAlertState({
            open: true,
            type: 'error',
            message: '服务已关停，请稍后再试！'
          })
        }
      }
    }
  };

  const withdraw = async () => {
    if (!isValidToValue()) {
      return setAlertState({
        open: true,
        type: 'warning',
        message: '请输入正确的数值'
      })
    }

    if (shouldExchange && !isValidAllowLoss()) {
      return setAlertState({
        open: true,
        type: 'warning',
        message: '请输入正确的Max Loss数值'
      })
    }
    const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss));
    const signer = userProvider.getSigner();
    const nextValue = `${toValue * 1e6}`;
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      if (shouldExchange) {
        const [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(nextValue, allowMaxLossValue, false, []);
        console.log('tokens, amounts=', tokens, amounts);
        const exchangeManager = await vaultContract.exchangeManager();
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
        // 查询兑换路径
        exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString();
            if (tokenItem === USDT_ADDRESS || exchangeAmounts === '0') {
              return undefined
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: 6,
                  symbol: 'USDT',
                  address: USDT_ADDRESS
                },
                amounts[index].toString(),
                slipper,
                exchangePlatformAdapters,
                EXCHANGE_EXTRA_PARAMS
              )
              return {
                fromToken: tokenItem,
                toToken: USDT_ADDRESS,
                fromAmount: exchangeAmounts,
                exchangeParam: bestSwapInfo
              }
            } catch (error) {
              return
            }
          })
        )
      }
      const nextArray = filter(exchangeArray, i => !isEmpty(i));
      console.log('nextArray=', nextArray);
      const gas = await vaultContractWithSigner.estimateGas.withdraw(nextValue, allowMaxLossValue, true, nextArray);
      await vaultContractWithSigner.callStatic.withdraw(nextValue, allowMaxLossValue, true, nextArray, {
        gasLimit: gas * MULTIPLE_OF_GAS
      });
      const tx = await vaultContractWithSigner.withdraw(nextValue, allowMaxLossValue, true, nextArray, {
        gasLimit: gas * MULTIPLE_OF_GAS
      });

      await tx.wait();
      setToValue(0);
      setAlertState({
        open: true,
        type: 'success',
        message: '数据提交成功'
      });
    } catch (error) {
      console.error(error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          setAlertState({
            open: true,
            type: 'error',
            message: '服务已关停，请稍后再试！'
          })
        } else if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'Return amount is not enough\''
          || error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'Received amount of tokens are less then expected\'') {
          setAlertState({
            open: true,
            type: 'error',
            message: '兑换失败，请加大兑换滑点或关闭兑换功能！'
          })
        }
      }
    }
  };
  const loadTotalAssets = () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.totalAssets().then(resp => {
      if (resp.eq(totalAssets)) return;
      setBeforeTotalAssets(totalAssets);
      setTotalAssets(resp);
    }).catch(noop);
  }
  /**
   * 关闭提示框的方法回调
   * @param {*} event 
   * @param {*} reason 
   * @returns 
   */
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertState({
      ...alertState,
      open: false,
    })
  }
  useEffect(() => {
    const timer = setInterval(loadTotalAssets, 3000);
    return () => clearInterval(timer);
  }, [totalAssets.toString()]);

  useEffect(() => {
    loadBanlance();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.on('Deposit', (a, b, c) => {
      console.log('Deposit=', a, b, c)
      c && c.getTransaction().then(tx => tx.wait()).then(loadBanlance);
    });
    vaultContract.on('Withdraw', (a, b, c, d, e, f) => {
      console.log('Withdraw=', a, b, c, d, e, f)
      f && f.getTransaction().then(tx => tx.wait()).then(loadBanlance);

    });

    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"]);
  }, [address]);

  // 展示vault.totalAssets
  const fn = value => <span>$ {toFixed(value, 10 ** 6, 6)}</span>;

  // 展示时间倒计时
  const countFn = (value) => {
    const { hourTime, minuteTime, secondTime } = getTime(dealLine - value);// 秒
    return <span style={{ color: '#ff4d4f' }}> ({hourTime}:{minuteTime}:{secondTime})</span>
  }

  const isValidToValueFlag = isValidToValue();
  const isValidFromValueFlag = isValidFromValue();
  const isValidAllowLossFlag = isValidAllowLoss();

  return (
    <div>
      <Header
        color="transparent"
        brand="Bank Of Chain"
        rightLinks={<HeaderLinks {...props} />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
        {...props}
      />
      <Parallax image={require("./images/bg-1.jpg")}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem>
              <div className={classes.brand}>
                <h2 className={classes.subtitle}>
                  锁仓量: <CountTo from={beforeTotalAssets.toNumber()} to={totalAssets.toNumber()} speed={3500} >{fn}</CountTo>
                </h2>
                <h2 className={classes.subtitle}>
                  Price Per Fullshares: {toFixed(perFullShare, usdtDecimals, 6)}
                </h2>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <GridContainer className={classNames(classes.center)}>
            <GridItem xs={12} sm={12} md={8}>
              <CustomTabs
                headerColor="primary"
                tabs={[
                  {
                    tabName: 'USDT',
                    // tabIcon: () => <image src='https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png' />,
                    tabContent: (
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6} lg={6}>
                          <CustomInput
                            labelText={`Balance: ${toFixed(fromBalance, 10 ** 6)}`}
                            inputProps={{
                              placeholder: "Please input a deposit amount",
                              value: fromValue,
                              endAdornment: <span style={{ color: '#69c0ff', cursor: 'pointer' }} onClick={() => setFromValue(parseInt(toFixed(fromBalance, 10 ** 6)))}>Max</span>,
                              onChange: (event) => {
                                try {
                                  if (event.target.value === '-') {
                                    setFromValue(event.target.value);
                                    return
                                  }
                                  const nextValue = parseInt(event.target.value)
                                  if (isNaN(nextValue)) {
                                    throw new Error('数值转换失败');
                                  }
                                  setFromValue(nextValue)
                                } catch (error) {
                                  setFromValue('');
                                }
                              }
                            }}
                            error={!isUndefined(isValidFromValueFlag) && !isValidFromValueFlag}
                            success={!isUndefined(isValidFromValueFlag) && isValidFromValueFlag}
                            formControlProps={{
                              fullWidth: true
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6} lg={6}>
                          <CustomInput
                            labelText={`Balance: ${toFixed(toBalance, 10 ** 6)} (~${toFixed(toBalance.mul(perFullShare), 10 ** 12, 2)} USDT)`}
                            inputProps={{
                              placeholder: "Please input a withdraw amount",
                              value: toValue,
                              endAdornment: <span style={{ color: '#69c0ff', cursor: 'pointer' }} onClick={() => setToValue(parseInt(toFixed(toBalance, 10 ** 6)))}>Max</span>,
                              onChange: (event) => {
                                try {
                                  if (event.target.value === '-') {
                                    setToValue(event.target.value);
                                    return
                                  }
                                  const nextValue = parseInt(event.target.value)
                                  if (isNaN(nextValue)) {
                                    throw new Error('数值转换失败');
                                  }
                                  setToValue(nextValue);
                                } catch (error) {
                                  setToValue('');
                                }
                              }
                            }}
                            error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag}
                            success={!isUndefined(isValidToValueFlag) && isValidToValueFlag}
                            formControlProps={{
                              fullWidth: true
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6} lg={6} />
                        <GridItem xs={12} sm={12} md={6} lg={6}>
                          <GridContainer>
                            <GridItem xs={6} sm={6} md={6} lg={6}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={shouldExchange}
                                    onChange={(event) => setShouldExchange(event.target.checked)}
                                    classes={{
                                      switchBase: classes.switchBase,
                                      checked: classes.switchChecked,
                                      thumb: classes.switchIcon,
                                      track: classes.switchBar,
                                    }}
                                  />
                                }
                                style={{ padding: '24px 0' }}
                                classes={{
                                  label: classes.label,
                                }}
                                label={<Muted>{shouldExchange ? "开启兑换" : "关闭兑换"}</Muted>}
                              />
                            </GridItem>
                            <GridItem md={6} style={shouldExchange ? {} : { visibility: 'hidden' }}>
                              <CustomInput
                                labelText="Max Loss"
                                inputProps={{
                                  placeholder: "Allow loss percent",
                                  value: allowMaxLoss,
                                  endAdornment: <span>%&nbsp;&nbsp;&nbsp;<span style={{ color: '#69c0ff', cursor: 'pointer' }} onClick={() => setAllowMaxLoss(50)}>Max</span></span>,
                                  onChange: (event) => {
                                    const value = event.target.value;
                                    setAllowMaxLoss(value);
                                  }
                                }}
                                error={!isUndefined(isValidAllowLossFlag) && !isValidAllowLossFlag}
                                success={!isUndefined(isValidAllowLossFlag) && isValidAllowLossFlag}
                                formControlProps={{
                                  fullWidth: true
                                }}
                              />
                            </GridItem>
                          </GridContainer>
                        </GridItem>
                        <GridItem xs={6} sm={6} md={6} lg={6}>
                          <Button color="primary" onClick={diposit} >Deposit</Button>
                        </GridItem>
                        <GridItem xs={6} sm={6} md={6} lg={6}>
                          <Button color="primary" onClick={withdraw} >Withdraw</Button>
                          {
                            lastDepositTimes.gt(0) && withdrawFee.gt(0) && toBalance.gt(0) && <Tooltip
                              title="距离上一次存款时间未达到24小时，支取需要支付额外的手续费用。"
                              placement={window.innerWidth > 959 ? "top" : "left"}
                              classes={{ tooltip: classes.tooltip }}
                            >
                              <span style={{ color: '#ff4d4f', paddingLeft: 5, cursor: 'pointer' }}>
                                {toFixed(withdrawFee, 10 ** 2, 2)}%<CountTo to={dealLine.toNumber()} delay={1000} speed={60 * 60 * 24 * 1000} >{countFn}</CountTo>
                              </span>
                            </Tooltip>
                          }
                        </GridItem>
                      </GridContainer>
                    ),
                  }
                ]}
              />
            </GridItem>
          </GridContainer>
        </div>
      </div>
      <Footer />
      <Snackbar open={alertState.open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={alertState.type}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
