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
import Snackbar from "@material-ui/core/Snackbar";
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import KeyboardHideIcon from '@material-ui/icons/KeyboardHide';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import AddIcon from '@material-ui/icons/Add';
import Radio from "@material-ui/core/Radio";
import AndroidIcon from '@material-ui/icons/Android';
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, IERC20_ABI, USDT_ADDRESS, EXCHANGE_AGGREGATOR_ABI, EXCHANGE_EXTRA_PARAMS, MULTIPLE_OF_GAS, CHAIN_BROWSER_URL } from "../../constants";

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils";
import { toFixed } from "../../helpers/number-format";
import map from "lodash/map";
import get from "lodash/get";
import debounce from "lodash/debounce";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import isUndefined from "lodash/isUndefined";
import noop from "lodash/noop";
import * as ethers from "ethers";
import getApyByDays from './../../helpers/api-service';

// === Styles === //
import styles from "./style";

const useStyles = makeStyles(styles);
const { BigNumber } = ethers;

const days = [1, 3, 7, 30, 90, 365];

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

  const [allowMaxLoss, setAllowMaxLoss] = useState('0.3');
  const [shouldExchange, setShouldExchange] = useState(true);
  const [focusInput, setFocusInput] = useState(false);
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([]);
  const [isEstimate, setIsEstimate] = useState(false);
  const [isOpenEstimate, setIsOpenEstimate] = useState(true);
  // 模态框标识位
  const [alertState, setAlertState] = useState({
    open: false,
    type: '',
    message: ''
  });

  const [vaultApys, setVaultApys] = useState([]);

  const [currentDays, setCurrentDays] = useState(1);

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance;
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);

    Promise.all([
      usdtContract.balanceOf(address).then(setFromBalance),
      vaultContract.balanceOf(address).then(setToBalance).catch(console.error),
      vaultContract.pricePerShare().then(setPerFullShare).catch(console.error),
      // vaultContract.token().then(setToken),
      // vaultContract.getTrackedAssets().then(setTrackedAssets)
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
    if (isNaN(fromValue)) return false;
    const value = fromValue * usdtDecimals;
    const intValue = parseInt(value);
    if (fromBalance.lt(intValue.toString())) return false;
    if (value !== intValue) return false;
    return true;
  }

  /**
   * 校验toValue是否为有效输入
   * @returns 
   */
  const isValidToValue = () => {
    if (toValue === '' || toValue === '-') return;
    if (toValue < 0) return false;
    if (isNaN(toValue)) return false;
    const value = toValue * usdtDecimals;
    const intValue = parseInt(value);
    if (toBalance.lt(intValue.toString())) return false;
    if (value !== intValue) return false;
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
      setFromValue('');
      setAlertState({
        open: true,
        type: 'success',
        message: '数据提交成功'
      })
    } catch (error) {
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES or AD\'') {
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
                allowMaxLossValue,
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
      setToValue('');
      setAlertState({
        open: true,
        type: 'success',
        message: '数据提交成功'
      });
    } catch (error) {
      console.error(error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES or AD\'') {
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
  // 加载apy数据
  const loadApy = async () => {
    const requestArray = await Promise.all(map(days, day => getApyByDays(day).catch(error => 0)));
    setVaultApys(requestArray);
  }
  useEffect(() => {
    const timer = setInterval(loadTotalAssets, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [totalAssets.toString()]);

  useEffect(() => {
    loadBanlance();
    loadApy();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    if (!isEmpty(address)) {
      vaultContract.on('Deposit', (a, b, c) => {
        console.log('Deposit=', a, b, c)
        c && c.getTransaction().then(tx => tx.wait()).then(loadBanlance);
      });
      vaultContract.on('Withdraw', (a, b, c, d, e, f) => {
        console.log('Withdraw=', a, b, c, d, e, f)
        f && f.getTransaction().then(tx => tx.wait()).then(loadBanlance);
      });
    }

    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"]);
    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    if (!isValidToValue() || !isOpenEstimate) return

    const estimateWithdraw = debounce(async () => {
      setIsEstimate(true);
      const nextValue = `${toValue * usdtDecimals}`;
      const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss));
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      vaultContract.callStatic.withdraw(nextValue, allowMaxLossValue, shouldExchange, []).then(async ([tokens, amounts]) => {
        let nextEstimateWithdrawArray = compact(
          map(tokens, (token, index) => {
            const amount = get(amounts, index, BigNumber.from(0))
            if (amount.gt(0)) {
              return {
                tokenAddress: token,
                amounts: amount
              }
            }
          })
        )
        if (shouldExchange) {
          nextEstimateWithdrawArray = [{
            tokenAddress: USDT_ADDRESS,
            amounts: perFullShare.mul((toValue * usdtDecimals).toString()).div(usdtDecimals)
          }]
        }
        setEstimateWithdrawArray(nextEstimateWithdrawArray);
      }).catch(() => {
        setEstimateWithdrawArray(undefined);
      }).finally(() => {
        setTimeout(() => {
          setIsEstimate(false);
        }, 1000);
      });
    }, 1000)
    estimateWithdraw();
    // eslint-disable-next-line
  }, [toValue, allowMaxLoss, shouldExchange, isOpenEstimate])

  // 展示vault.totalAssets
  const fn = value => <span>{toFixed(value, 10 ** 6, 6)} USDT</span>;

  /**
   * 将ERC20币添加入metamask账户中
   */
  const addToken = async (token) => {
    try {
      const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider);
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: token, // The address that the token is at.
            symbol: await tokenContract.symbol(), // A ticker symbol or shorthand, up to 5 chars.
            decimals: await tokenContract.decimals(), // The number of decimals in the token
          },
        },
      });

      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return <GridItem xs={12} sm={12} md={12} lg={12}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <CircularProgress fontSize="large" color="primary" />
        </div>
      </GridItem>
    }
    if (isUndefined(estimateWithdrawArray)) {
      return <GridItem xs={12} sm={12} md={12} lg={12}>
        <div style={{ textAlign: 'center', minHeight: '100px', color: '#fff' }}>
          <ErrorOutlineIcon fontSize="large" />
          <p>数额预估失败，请重新获取！</p>
        </div>
      </GridItem>
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return <GridItem xs={12} sm={12} md={12} lg={12}>
        <div style={{ textAlign: 'center', minHeight: '100px', color: '#fff' }}>
          <AndroidIcon fontSize="large" />
          <p style={{ marginTop: 0 }}>暂无预估数值</p>
        </div>
      </GridItem>
    }
    return map(estimateWithdrawArray, item => {
      return <GridItem key={item.tokenAddress} xs={12} sm={12} md={6} lg={6}>
        <Button
          title="Add token address to wallet"
          color="transparent"
          target="_blank"
          style={{ fontSize: 20 }}
          onClick={() => addToken(item.tokenAddress)}
        >
          <AddIcon fontSize="small" style={{ position: 'absolute', top: 40, left: 63 }} />
          <img className={classes.img} alt="" src={`./images/${item.tokenAddress}.webp`} />&nbsp;&nbsp;~&nbsp;{item.amounts.toString()}
        </Button>
      </GridItem>
    })
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
      <Parallax>
        <div className={classes.container}>
          <GridContainer>
            <GridItem>
              <div className={classes.brand}>
                <h2 className={classes.subtitle}>
                  锁仓量:&nbsp;&nbsp;<CountTo from={beforeTotalAssets.toNumber()} to={totalAssets.toNumber()} speed={3500} >{fn}</CountTo>
                </h2>
                <h2 className={classes.subtitle}>
                  BOC USDT单价:&nbsp;&nbsp;{toFixed(perFullShare, usdtDecimals, 6)} USDT
                </h2>
                <h2 className={classes.subtitle}>
                  年化收益率:&nbsp;&nbsp;<span className={classes.apyText}>{toFixed(get(vaultApys, currentDays, BigNumber.from(0)), 100, 2)}%</span>&nbsp;&nbsp;&nbsp;
                  {
                    map(days, (day, index) => {
                      return <FormControlLabel
                        key={index}
                        control={
                          <Radio
                            checked={index === currentDays}
                            onChange={() => setCurrentDays(day)}
                            value={day}
                            name={`${day}天`}
                            icon={
                              <FiberManualRecord className={classes.radioUnchecked} />
                            }
                            checkedIcon={
                              <FiberManualRecord className={classes.radioChecked} />
                            }
                            classes={{
                              checked: classes.radio,
                              root: classes.radioRoot,
                            }}
                          />
                        }
                        classes={{
                          label: classes.label,
                          root: classes.labelRoot,
                        }}
                        label={`${day}天`}
                      />
                    })
                  }
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
                    tabContent: (
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6} lg={6}>
                          <CustomInput
                            labelText={`Balance: ${toFixed(fromBalance, 10 ** 6)}`}
                            inputProps={{
                              placeholder: "Please input a deposit amount",
                              value: fromValue,
                              endAdornment: <span style={{ color: '#69c0ff', cursor: 'pointer' }} onClick={() => setFromValue(toFixed(fromBalance, 10 ** 6))}>Max</span>,
                              onChange: (event) => {
                                try {
                                  setFromValue(event.target.value)
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
                            labelText={`BOC USDT: ${toFixed(toBalance, 10 ** 6)}${focusInput ? ` (~${toFixed(toBalance.mul(perFullShare), 10 ** 12, 2)} USDT)` : ''}`}
                            inputProps={{
                              onFocus: () => setFocusInput(true),
                              onBlur: () => setFocusInput(false),
                              placeholder: "Please input a withdraw amount",
                              value: toValue,
                              endAdornment: <span style={{ color: '#69c0ff', cursor: 'pointer' }} onClick={() => setToValue(toFixed(toBalance, 10 ** 6))}>Max</span>,
                              onChange: (event) => {
                                try {
                                  setToValue(event.target.value);
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
                        <GridItem xs={12} sm={12} md={6} lg={6} >
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={12} lg={12}>
                              <Muted><p style={{ fontSize: 18, wordBreak: 'break-all', lineHeight: '62px' }}>份额预估：{isValidFromValueFlag && toFixed(perFullShare.mul(fromValue), usdtDecimals, 6)}</p></Muted>
                            </GridItem>
                          </GridContainer>
                        </GridItem>
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
                            <GridItem xs={6} sm={6} md={6} style={shouldExchange ? {} : { visibility: 'hidden' }}>
                              <CustomInput
                                labelText="Max Loss"
                                inputProps={{
                                  placeholder: "Allow loss percent",
                                  value: allowMaxLoss,
                                  endAdornment: <span style={{ color: '#69c0ff' }}>%&nbsp;&nbsp;&nbsp;<span style={{ cursor: 'pointer' }} onClick={() => setAllowMaxLoss(50)}>Max</span></span>,
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
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          {
                            isOpenEstimate ? <GridContainer>
                              <GridItem xs={12} sm={12} md={12} lg={12}>
                                <Muted><p style={{ fontSize: 18 }}>提取数额预估：<KeyboardIcon fontSize="large" style={{ float: 'right', cursor: 'pointer' }} onClick={() => setIsOpenEstimate(false)}></KeyboardIcon></p></Muted>
                              </GridItem>
                              {renderEstimate()}
                            </GridContainer> :
                              <GridContainer>
                                <GridItem xs={12} sm={12} md={12} lg={12}>
                                  <Muted>
                                    <p style={{ fontSize: 18 }}>
                                      开启提取份额预估计算
                                      <KeyboardHideIcon fontSize="large" style={{ float: 'right', cursor: 'pointer' }} onClick={() => setIsOpenEstimate(true)}></KeyboardHideIcon>
                                    </p>
                                  </Muted>
                                </GridItem>
                              </GridContainer>
                          }
                        </GridItem>
                        <GridItem xs={6} sm={6} md={6} lg={6}>
                          <Button color="colorfull" onClick={diposit} >Deposit</Button>
                        </GridItem>
                        <GridItem xs={6} sm={6} md={6} lg={6}>
                          <Button color="colorfull" onClick={withdraw} >Withdraw</Button>
                        </GridItem>
                      </GridContainer>
                    ),
                  }
                ]}
              />
            </GridItem>
          </GridContainer>
          <p style={{ color: '#fff' }}>有关此 Vault 更多的信息</p>
          <TableContainer component={Paper} style={{ borderRadius: 0 }}>
            <Table className={classNames(classes.table)} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className={classNames(classes.tableCell)}>
                    Vault 通证符号
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    Vault 合约地址
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    质押通证符号
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    质押合约地址
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    TVL（总锁仓量）
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                <TableRow>
                  <TableCell className={classNames(classes.tableCell)} component="th" scope="row">
                    BOC_Vault
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    <a href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${VAULT_ADDRESS}`} target="_blank" rel="noopener noreferrer">{VAULT_ADDRESS}</a>
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    USDT
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    <a href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${USDT_ADDRESS}`} target="_blank" rel="noopener noreferrer">{USDT_ADDRESS}</a>
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} align="right">
                    {toFixed(totalAssets, 10 ** 6, 6)}USDT
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      <Footer whiteFont />
      <Snackbar open={alertState.open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={alertState.type}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
