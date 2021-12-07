import React, { useState, useEffect } from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
import Switch from "@material-ui/core/Switch"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import CountTo from "react-count-to"
// core components
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
// sections for this page
import HeaderLinks from "../../components/Header/HeaderLinks"
import CustomTabs from "../../components/CustomTabs/CustomTabs"
import CustomInput from "../../components/CustomInput/CustomInput"
import Button from "../../components/CustomButtons/Button"
import Muted from "../../components/Typography/Muted"
import Snackbar from "@material-ui/core/Snackbar"
import Alert from "@material-ui/lab/Alert"
import CircularProgress from "@material-ui/core/CircularProgress"
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline"
import AddIcon from "@material-ui/icons/Add"
import AndroidIcon from "@material-ui/icons/Android"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import CropFreeIcon from "@material-ui/icons/CropFree"
import CropIcon from "@material-ui/icons/Crop"

// === constants === //
import {
  VAULT_ADDRESS,
  VAULT_ABI,
  IERC20_ABI,
  USDT_ADDRESS,
  EXCHANGE_AGGREGATOR_ABI,
  EXCHANGE_EXTRA_PARAMS,
  MULTIPLE_OF_GAS,
  CHAIN_BROWSER_URL,
} from "../../constants"

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils"
import { toFixed } from "../../helpers/number-format"
import map from "lodash/map"
import get from "lodash/get"
import debounce from "lodash/debounce"
import compact from "lodash/compact"
import isEmpty from "lodash/isEmpty"
import filter from "lodash/filter"
import isUndefined from "lodash/isUndefined"
import noop from "lodash/noop"
import * as ethers from "ethers"
import BN from "bignumber.js"

// === Styles === //
import styles from "./style"

const useStyles = makeStyles(styles)
const { BigNumber } = ethers

const getExchangePlatformAdapters = async exchangeAggregator => {
  const adapters = await exchangeAggregator.getExchangeAdapters()
  const exchangePlatformAdapters = {}
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i]
  }
  return exchangePlatformAdapters
}

export default function Invest (props) {
  const classes = useStyles()
  const { address, userProvider } = props
  const [usdtDecimals, setUsdtDecimals] = useState(0)
  const [beforeTotalAssets, setBeforeTotalAssets] = useState(BigNumber.from(0))
  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0))

  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0))
  const [toBalance, setToBalance] = useState(BigNumber.from(0))
  const [beforePerFullShare, setBeforePerFullShare] = useState(BigNumber.from(1))
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1))

  const [allowMaxLoss, setAllowMaxLoss] = useState("0.3")
  const [shouldExchange, setShouldExchange] = useState(true)
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimate, setIsOpenEstimate] = useState(false)
  const [totalSupply, setTotalSupply] = useState(BigNumber.from(0))
  // 模态框标识位
  const [alertState, setAlertState] = useState({
    open: false,
    type: "",
    message: "",
  })

  // 载入账户数据
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)

    Promise.all([
      usdtContract.balanceOf(address).then(setFromBalance),
      vaultContract
        .balanceOf(address)
        .then(setToBalance)
        .catch(noop),
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare]) => {
          setBeforeTotalAssets(afterTotalAssets)
          setTotalAssets(afterTotalAssets)
          setBeforePerFullShare(afterPerFullShare)
          setPerFullShare(afterPerFullShare)
        })
        .catch(noop),
      // TODO:此处的usdtDecimals较特别为10的幂的数值，主要是因为lend方法里的usdtDecimals取幂操作
      // 其他处的usdtDecimals都是为10**18或10**6
      usdtContract.decimals().then(setUsdtDecimals),
      vaultContract.totalSupply().then(setTotalSupply),
      // vaultContract.token().then(setToken),
      // vaultContract.getTrackedAssets().then(setTrackedAssets)
    ]).catch(() => {
      setAlertState({
        open: true,
        type: "warning",
        message: "请确认MetaMask的当前网络！",
      })
    })
  }

  /**
   * 校验fromValue是否为有效输入
   * @returns
   */
  const isValidFromValue = () => {
    if (fromValue === "" || fromValue === "-") return
    // 如果不是一个数值
    if (isNaN(Number(fromValue))) return false
    const nextFromValue = BN(fromValue).multipliedBy(
      BigNumber.from(10)
        .pow(usdtDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextFromValue.lt(0)) return false
    // 精度处理完之后，应该为整数
    if (nextFromValue.toFixed().indexOf(".") !== -1) return false
    // 数值小于最大数量
    if (fromBalance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
    return true
  }

  /**
   * 校验toValue是否为有效输入
   * @returns
   */
  const isValidToValue = () => {
    if (toValue === "" || toValue === "-") return
    // 如果不是一个数值
    if (isNaN(Number(toValue))) return false
    const nextToValue = BN(toValue).multipliedBy(
      BigNumber.from(10)
        .pow(usdtDecimals)
        .toString(),
    )
    // 判断值为正数
    if (nextToValue.lt(0)) return false
    // 精度处理完之后，应该为整数
    if (nextToValue.toFixed().indexOf(".") !== -1) return false
    // 数值小于最大数量
    if (toBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  /**
   * 校验allow loss是否为有效输入
   * @returns
   */
  const isValidAllowLoss = () => {
    if (allowMaxLoss === "") return
    if (isNaN(allowMaxLoss)) return false
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false
    return true
  }

  const diposit = async () => {
    // 如果输入的数字不合法，弹出提示框
    if (!isValidFromValue()) {
      return setAlertState({
        open: true,
        type: "warning",
        message: "请输入正确的数值",
      })
    }
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const usdtContractWithUser = usdtContract.connect(signer)
    const nVaultWithUser = vaultContract.connect(signer)
    let nextValue = BigNumber.from(
      BN(fromValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdtDecimals)
            .toString(),
        )
        .toFixed(),
    )
    try {
      // 获取当前允许的额度
      const allowanceAmount = await usdtContractWithUser.allowance(address, VAULT_ADDRESS)
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextValue.gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0)
          await firstApproveTx.wait()
        }
        console.log("当前授权：", allowanceAmount.toString(), "准备授权：", nextValue.toString())
        const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue)
        await secondApproveTx.wait()
      }
      const depositTx = await nVaultWithUser.deposit(nextValue)
      await depositTx.wait()
      setFromValue("")
      setAlertState({
        open: true,
        type: "success",
        message: "数据提交成功",
      })
    } catch (error) {
      if (error && error.data) {
        if (
          error.data.message && error.data.message.endsWith('\'ES or AD\'')
        ) {
          setAlertState({
            open: true,
            type: "error",
            message: "服务已关停，请稍后再试！",
          })
        }
      }
    }
  }

  const withdraw = async () => {
    if (!isValidToValue()) {
      return setAlertState({
        open: true,
        type: "warning",
        message: "请输入正确的数值",
      })
    }

    if (shouldExchange && !isValidAllowLoss()) {
      return setAlertState({
        open: true,
        type: "warning",
        message: "请输入正确的Max Loss数值",
      })
    }
    const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss))
    const signer = userProvider.getSigner()
    const nextValue = BigNumber.from(
      BN(toValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(usdtDecimals)
            .toString(),
        )
        .toFixed(),
    )
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      if (shouldExchange) {
        const [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(
          nextValue,
          allowMaxLossValue,
          false,
          [],
        )
        console.log("tokens, amounts=", tokens, amounts)
        const exchangeManager = await vaultContract.exchangeManager()
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider)
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
        // 查询兑换路径
        exchangeArray = await Promise.all(
          map(tokens, async (tokenItem, index) => {
            const exchangeAmounts = amounts[index].toString()
            if (tokenItem === USDT_ADDRESS || exchangeAmounts === "0") {
              return undefined
            }
            const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
            const fromToken = {
              decimals: parseInt((await fromConstrat.decimals()).toString()),
              symbol: await fromConstrat.symbol(),
              address: tokenItem,
            }
            try {
              const bestSwapInfo = await getBestSwapInfo(
                fromToken,
                {
                  decimals: usdtDecimals,
                  symbol: "USDT",
                  address: USDT_ADDRESS,
                },
                amounts[index].toString(),
                allowMaxLossValue,
                exchangePlatformAdapters,
                EXCHANGE_EXTRA_PARAMS,
              )
              return {
                fromToken: tokenItem,
                toToken: USDT_ADDRESS,
                fromAmount: exchangeAmounts,
                exchangeParam: bestSwapInfo,
              }
            } catch (error) {
              return
            }
          }),
        )
      }
      const nextArray = filter(exchangeArray, i => !isEmpty(i))
      console.log("nextArray=", nextArray)
      const gas = await vaultContractWithSigner.estimateGas.withdraw(nextValue, allowMaxLossValue, true, nextArray)
      await vaultContractWithSigner.callStatic.withdraw(nextValue, allowMaxLossValue, true, nextArray, {
        gasLimit: gas * MULTIPLE_OF_GAS,
      })
      const tx = await vaultContractWithSigner.withdraw(nextValue, allowMaxLossValue, true, nextArray, {
        gasLimit: gas * MULTIPLE_OF_GAS,
      })

      await tx.wait()
      setToValue("")
      setAlertState({
        open: true,
        type: "success",
        message: "数据提交成功",
      })
    } catch (error) {
      console.error(error)
      if (error && error.data && error.data.message) {
        if (
          error.data.message && error.data.message.endsWith('\'ES or AD\'')
        ) {
          setAlertState({
            open: true,
            type: "error",
            message: "服务已关停，请稍后再试！",
          })
        } else if (
          error.data.message.endsWith('\'loss much\'') ||
          error.data.message.endsWith('\'Return amount is not enough\'') || 
          error.data.message.endsWith('\'Received amount of tokens are less then expected\'')
        ) {
          setAlertState({
            open: true,
            type: "error",
            message: "兑换失败，请加大兑换滑点或关闭兑换功能！",
          })
        }
      }
    }
  }
  const loadTotalAssets = () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    return Promise.all([vaultContract.totalAssets(), vaultContract.pricePerShare()])
  }
  /**
   * 关闭提示框的方法回调
   * @param {*} event
   * @param {*} reason
   * @returns
   */
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }

    setAlertState({
      ...alertState,
      open: false,
    })
  }
  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    const loadTotalAssetsFn = () =>
      loadTotalAssets()
        .then(([afterTotalAssets, afterPerFullShare]) => {
          if (!afterTotalAssets.eq(beforeTotalAssets)) {
            setBeforeTotalAssets(totalAssets)
            setTotalAssets(afterTotalAssets)
          }
          if (!afterPerFullShare.eq(beforePerFullShare)) {
            setBeforePerFullShare(perFullShare)
            setPerFullShare(afterPerFullShare)
          }
        })
        .catch(noop)
    const timer = setInterval(loadTotalAssetsFn, 3000)
    return () => clearInterval(timer)
    // eslint-disable-next-line
  }, [totalAssets.toString(), perFullShare.toString()])

  useEffect(() => {
    if (isEmpty(VAULT_ADDRESS)) return
    loadBanlance()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    if (!isEmpty(address)) {
      vaultContract.on("Deposit", (a, b, c) => {
        console.log("Deposit=", a, b, c)
        c &&
          c
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
      vaultContract.on("Withdraw", (a, b, c, d, e, f) => {
        console.log("Withdraw=", a, b, c, d, e, f)
        f &&
          f
            .getTransaction()
            .then(tx => tx.wait())
            .then(loadBanlance)
      })
    }

    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
    // eslint-disable-next-line
  }, [address])

  useEffect(() => {
    if (!isValidToValue() || !isOpenEstimate) return

    const estimateWithdraw = debounce(async () => {
      setIsEstimate(true)
      const nextValue = BigNumber.from(
        BN(toValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(usdtDecimals)
              .toString(),
          )
          .toFixed(),
      )
      const allowMaxLossValue = parseInt(100 * parseFloat(allowMaxLoss))
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const signer = userProvider.getSigner()
      const vaultContractWithSigner = vaultContract.connect(signer)
      vaultContractWithSigner.callStatic
        .withdraw(nextValue, allowMaxLossValue, shouldExchange, [])
        .then(async ([tokens, amounts]) => {
          let nextEstimateWithdrawArray = compact(
            await Promise.all(
              map(tokens, async (token, index) => {
                const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
                const amount = get(amounts, index, BigNumber.from(0))
                if (amount.gt(0)) {
                  return {
                    tokenAddress: token,
                    decimals: await tokenContract.decimals(),
                    amounts: amount,
                  }
                }
              }),
            ),
          )
          if (shouldExchange) {
            const toValueString = BN(toValue)
              .multipliedBy(
                BigNumber.from(10)
                  .pow(usdtDecimals)
                  .toString(),
              )
              .toFixed()
            const target = BigNumber.from(10).pow(usdtDecimals)
            nextEstimateWithdrawArray = [
              {
                tokenAddress: USDT_ADDRESS,
                decimals: usdtDecimals,
                amounts: perFullShare.mul(BigNumber.from(toValueString)).div(target),
              },
            ]
          }
          setEstimateWithdrawArray(nextEstimateWithdrawArray)
        })
        .catch(() => {
          setEstimateWithdrawArray(undefined)
        })
        .finally(() => {
          setTimeout(() => {
            setIsEstimate(false)
          }, 1000)
        })
    }, 100)
    estimateWithdraw()
    // eslint-disable-next-line
  }, [toValue, allowMaxLoss, shouldExchange, isOpenEstimate])

  // 展示vault.totalAssets
  // const fn = value => <span>{toFixed(value, 10 ** 6, 6)} USDT</span>

  /**
   * 将ERC20币添加入metamask账户中
   */
  const addToken = async token => {
    try {
      const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: token, // The address that the token is at.
            symbol: await tokenContract.symbol(), // A ticker symbol or shorthand, up to 5 chars.
            decimals: await tokenContract.decimals(), // The number of decimals in the token
          },
        },
      })

      if (wasAdded) {
        console.log("Thanks for your interest!")
      } else {
        console.log("Your loss!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <CircularProgress fontSize='large' color='primary' />
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: 50 }}>
            <ErrorOutlineIcon fontSize='large' />
            <p>数额预估失败，请重新获取！</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div style={{ textAlign: "center", minHeight: "100px", color: "#fff", padding: 50 }}>
            <AndroidIcon fontSize='large' />
            <p style={{ marginTop: 0 }}>暂无预估数值</p>
          </div>
        </GridItem>
      )
    }
    return map(estimateWithdrawArray, item => {
      return (
        <GridItem key={item.tokenAddress} xs={12} sm={12} md={12} lg={12}>
          <Button
            title='Add token address to wallet'
            color='transparent'
            target='_blank'
            style={{ fontSize: 20, paddingBottom: 20 }}
            onClick={() => addToken(item.tokenAddress)}
          >
            <AddIcon fontSize='small' style={{ position: "absolute", top: 40, left: 63 }} />
            <img className={classes.img} alt='' src={`./images/${item.tokenAddress}.webp`} />
            &nbsp;&nbsp;~&nbsp;{toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), item.decimals)}
          </Button>
        </GridItem>
      )
    })
  }

  const isValidToValueFlag = isValidToValue()
  const isValidFromValueFlag = isValidFromValue()
  const isValidAllowLossFlag = isValidAllowLoss()
  let pricePerFullShare = BigNumber.from(10).pow(usdtDecimals)
  if (!totalSupply.eq(BigNumber.from(0))) {
    pricePerFullShare = totalAssets.mul(BigNumber.from(10).pow(usdtDecimals)).div(totalSupply)
  }

  return (
    <div>
      <Header
        color='transparent'
        brand='Bank Of Chain'
        rightLinks={<HeaderLinks {...props} />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
        {...props}
      />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>
          <GridContainer className={classNames(classes.center)}>
            <GridItem xs={12} sm={12} md={8}>
              <CustomTabs
                headerColor='primary'
                tabs={[
                  {
                    tabName: <img style={{ width: 65 }} alt='' src={`./images/${USDT_ADDRESS}.webp`} />,
                    tabContent: (
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          <CustomInput
                            labelText={`Balance: ${toFixed(fromBalance, BigNumber.from(10).pow(usdtDecimals))}`}
                            inputProps={{
                              placeholder: "deposit amount",
                              value: fromValue,
                              endAdornment: (
                                <span
                                  style={{ color: "#69c0ff", cursor: "pointer" }}
                                  onClick={() =>
                                    setFromValue(toFixed(fromBalance, BigNumber.from(10).pow(usdtDecimals)))
                                  }
                                >
                                  Max
                                </span>
                              ),
                              onChange: event => {
                                try {
                                  setFromValue(event.target.value)
                                } catch (error) {
                                  setFromValue("")
                                }
                              },
                            }}
                            error={!isUndefined(isValidFromValueFlag) && !isValidFromValueFlag}
                            success={!isUndefined(isValidFromValueFlag) && isValidFromValueFlag}
                            formControlProps={{
                              fullWidth: true,
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          <GridContainer>
                            <GridItem xs={8} sm={8} md={9} lg={9}>
                              <Muted>
                                <p
                                  style={{ fontSize: 14, wordBreak: "break-all" }}
                                >
                                  份额预估：
                                  {isValidFromValueFlag &&
                                    toFixed(
                                      BN(fromValue)
                                        .multipliedBy(
                                          BigNumber.from(10)
                                            .pow(usdtDecimals + usdtDecimals)
                                            .toString(),
                                        )
                                        .div(pricePerFullShare.toString())
                                        .toFixed(),
                                      BigNumber.from(10).pow(usdtDecimals),
                                      usdtDecimals,
                                    )}
                                </p>
                              </Muted>
                            </GridItem>
                            <GridItem xs={4} sm={4} md={3} lg={3}>
                              <Button color='colorfull' onClick={diposit}>
                                Deposit
                              </Button>
                            </GridItem>
                          </GridContainer>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          <CustomInput
                            labelText={
                              <CountTo from={beforePerFullShare.toNumber()} to={perFullShare.toNumber()} speed={3500}>
                                {v =>
                                  `BOC份额: ${toFixed(toBalance, BigNumber.from(10).pow(usdtDecimals))}${` (~${toFixed(
                                    toBalance.mul(v),
                                    BigNumber.from(10).pow(usdtDecimals + usdtDecimals),
                                    usdtDecimals,
                                  )} USDT)`}`
                                }
                              </CountTo>
                            }
                            // <CountTo from={beforeTotalAssets.toNumber()} to={totalAssets.toNumber()} speed={3500} >{fn}</CountTo>
                            inputProps={{
                              placeholder: "withdraw amount",
                              value: toValue,
                              endAdornment: (
                                <span
                                  style={{ color: "#69c0ff", cursor: "pointer" }}
                                  onClick={() => setToValue(toFixed(toBalance, BigNumber.from(10).pow(usdtDecimals)))}
                                >
                                  Max
                                </span>
                              ),
                              onChange: event => {
                                try {
                                  setToValue(event.target.value)
                                } catch (error) {
                                  setToValue("")
                                }
                              },
                            }}
                            error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag}
                            success={!isUndefined(isValidToValueFlag) && isValidToValueFlag}
                            formControlProps={{
                              fullWidth: true,
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12} lg={12}>
                          {isOpenEstimate ? (
                            <GridContainer>
                              <GridItem
                                xs={8}
                                sm={8}
                                md={9}
                                lg={9}
                                style={{ color: "#39d0d8", textAlign: "right", lineHeight: "35px", padding: "10px 0" }}
                              >
                                <CropIcon
                                  fontSize='large'
                                  style={{ float: "right", cursor: "pointer" }}
                                  onClick={() => setIsOpenEstimate(false)}
                                ></CropIcon>
                                <span style={{ cursor: "pointer" }} onClick={() => setIsOpenEstimate(false)}>
                                  Advanced Settings
                                </span>
                              </GridItem>
                              <GridItem xs={4} sm={4} md={3} lg={3}>
                                <Button color='colorfull' onClick={withdraw}>
                                  Withdraw
                                </Button>
                              </GridItem>
                              <GridItem xs={12} sm={12} md={12} lg={12}>
                                <GridContainer>
                                  <GridItem xs={4} sm={4} md={4} lg={4}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={shouldExchange}
                                          onChange={event => setShouldExchange(event.target.checked)}
                                          classes={{
                                            switchBase: classes.switchBase,
                                            checked: classes.switchChecked,
                                            thumb: classes.switchIcon,
                                            track: classes.switchBar,
                                          }}
                                        />
                                      }
                                      style={{ padding: "24px 0px 24px 30px" }}
                                      classes={{
                                        label: classes.label,
                                      }}
                                      label={<Muted>{shouldExchange ? "开启兑换" : "关闭兑换"}</Muted>}
                                    />
                                  </GridItem>
                                  <GridItem
                                    xs={8}
                                    sm={8}
                                    md={8}
                                    lg={8}
                                    style={shouldExchange ? {} : { visibility: "hidden" }}
                                  >
                                    <CustomInput
                                      labelText='Max Loss'
                                      inputProps={{
                                        placeholder: "Allow loss percent",
                                        value: allowMaxLoss,
                                        endAdornment: (
                                          <span style={{ color: "#69c0ff" }}>
                                            %&nbsp;&nbsp;&nbsp;
                                            <span style={{ cursor: "pointer" }} onClick={() => setAllowMaxLoss(50)}>
                                              Max
                                            </span>
                                          </span>
                                        ),
                                        onChange: event => {
                                          const value = event.target.value
                                          setAllowMaxLoss(value)
                                        },
                                      }}
                                      error={!isUndefined(isValidAllowLossFlag) && !isValidAllowLossFlag}
                                      success={!isUndefined(isValidAllowLossFlag) && isValidAllowLossFlag}
                                      formControlProps={{
                                        fullWidth: true,
                                      }}
                                    />
                                  </GridItem>
                                </GridContainer>
                              </GridItem>
                              {renderEstimate()}
                            </GridContainer>
                          ) : (
                            <GridContainer>
                              <GridItem
                                xs={8}
                                sm={8}
                                md={9}
                                lg={9}
                                style={{ color: "#da2eef", textAlign: "right", lineHeight: "35px", padding: "10px 0" }}
                              >
                                <CropFreeIcon
                                  fontSize='large'
                                  style={{ cursor: "pointer", float: "right" }}
                                  onClick={() => setIsOpenEstimate(true)}
                                ></CropFreeIcon>
                                <span style={{ cursor: "pointer" }} onClick={() => setIsOpenEstimate(true)}>
                                  Advanced Settings
                                </span>
                              </GridItem>
                              <GridItem xs={4} sm={4} md={3} lg={3}>
                                <Button color='colorfull' onClick={withdraw}>
                                  Withdraw
                                </Button>
                              </GridItem>
                            </GridContainer>
                          )}
                        </GridItem>
                      </GridContainer>
                    ),
                  },
                ]}
              />
            </GridItem>
          </GridContainer>
          <p style={{ color: "#fff" }}>有关此 Vault 更多的信息</p>
          <TableContainer component={Paper} style={{ borderRadius: 0 }}>
            <Table className={classNames(classes.table)} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell className={classNames(classes.tableCell)}>Vault 通证符号</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>单价</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>Vault 合约地址</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>质押通证符号</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>质押合约地址</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>TVL（总锁仓量）</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                    BOC_Vault
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)} component='th' scope='row'>
                    <CountTo from={beforePerFullShare.toNumber()} to={perFullShare.toNumber()} speed={3500}>
                      {v => toFixed(v, BigNumber.from(10).pow(usdtDecimals), usdtDecimals)}
                    </CountTo>
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)}>
                    <a
                      style={{ color: "rgb(105, 192, 255)" }}
                      href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${VAULT_ADDRESS}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {VAULT_ADDRESS}
                    </a>
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)}>USDT</TableCell>
                  <TableCell className={classNames(classes.tableCell)}>
                    <a
                      style={{ color: "rgb(105, 192, 255)" }}
                      href={CHAIN_BROWSER_URL && `${CHAIN_BROWSER_URL}/address/${USDT_ADDRESS}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {USDT_ADDRESS}
                    </a>
                  </TableCell>
                  <TableCell className={classNames(classes.tableCell)}>
                    <CountTo from={beforeTotalAssets.toNumber()} to={totalAssets.toNumber()} speed={3500}>
                      {v => {
                        return `${toFixed(v, BigNumber.from(10).pow(usdtDecimals), usdtDecimals)}USDT`
                      }}
                    </CountTo>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      <Footer whiteFont />
      <Snackbar
        open={alertState.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alertState.type}>{alertState.message}</Alert>
      </Snackbar>
    </div>
  )
}
