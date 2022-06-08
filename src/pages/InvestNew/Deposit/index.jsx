import React, { useState, useEffect, useRef } from "react"

// === Utils === //
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import isUndefined from "lodash/isUndefined"
import map from "lodash/map"
import some from "lodash/some"
import every from "lodash/every"
import reduce from "lodash/reduce"
import debounce from "lodash/debounce"
import isEmpty from "lodash/isEmpty"
import get from "lodash/get"
import { makeStyles } from "@material-ui/core/styles"
import moment from "moment"
import { getLastPossibleRebaseTime } from "../../../helpers/time-util"

// === Components === //
import Step from "@material-ui/core/Step"
import BocStepper from "../../../components/Stepper/Stepper"
import BocStepLabel from "../../../components/Stepper/StepLabel"
import BocStepIcon from "../../../components/Stepper/StepIcon"
import BocStepConnector from "../../../components/Stepper/StepConnector"
import Typography from '@material-ui/core/Typography';
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import MButton from '@material-ui/core/Button';
import Tooltip from "@material-ui/core/Tooltip"
import InfoIcon from "@material-ui/icons/Info"

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import CustomTextField from "../../../components/CustomTextField"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { toFixed, formatBalance } from "../../../helpers/number-format"

// === Constants === //
import {
  USDT_ADDRESS,
  USDC_ADDRESS,
  DAI_ADDRESS,
} from "../../../constants"

// === Styles === //
import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)
const TOKEN = {
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI',
}

const steps = ['Step1: Deposit', 'Get USDi Ticket', 'Step2: Allocation Action', 'Get USDi']

export default function Deposit({
  address,
  usdtBalance,
  usdtDecimals,
  usdcBalance,
  usdcDecimals,
  daiBalance,
  daiDecimals,
  usdiDecimals,
  userProvider,
  VAULT_ABI,
  IERC20_ABI,
  VAULT_ADDRESS,
  abi_version
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [usdtValue, setUsdtValue] = useState("")
  const [usdcValue, setUsdcValue] = useState("")
  const [daiValue, setDaiValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const nextRebaseTime = getLastPossibleRebaseTime()

  const tokenBasicState = {
    [TOKEN.USDT]: {
      value: usdtValue,
      balance: usdtBalance,
      decimals: usdtDecimals,
    },
    [TOKEN.USDC]: {
      value: usdcValue,
      balance: usdcBalance,
      decimals: usdcDecimals
    },
    [TOKEN.DAI]: {
      value: daiValue,
      balance: daiBalance,
      decimals: daiDecimals
    }
  }

  const formConfig = [{
    name: TOKEN.USDT,
    address: USDT_ADDRESS,
    image: './images/0x55d398326f99059fF775485246999027B3197955.png',
    setValue: setUsdtValue,
    isValid: isValidValue(TOKEN.USDT),
    ...tokenBasicState[TOKEN.USDT],
  }, {
    name: TOKEN.USDC,
    address: USDC_ADDRESS,
    image: './images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
    setValue: setUsdcValue,
    isValid: isValidValue(TOKEN.USDC),
    ...tokenBasicState[TOKEN.USDC],
  }, {
    name: TOKEN.DAI,
    address: DAI_ADDRESS,
    image: './images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png',
    setValue: setDaiValue,
    isValid: isValidValue(TOKEN.DAI),
    ...tokenBasicState[TOKEN.DAI],
  }]

  /**
   * 校验value是否为有效输入
   * @returns
   */
  function isValidValue(token) {
    const { value, balance, decimals } = tokenBasicState[token]
    if (value === "" || value === "-" || value === '0') return
    // 如果不是一个数值
    if (isNaN(Number(value))) return false
    const nextValue = BN(value)
    const nextFromValue = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(decimals)
        .toString(),
    )
    // 判断值为正数
    if (nextFromValue.lte(0)) return false
    // 精度处理完之后，应该为整数
    const nextFromValueString = nextValue.multipliedBy(
      BigNumber.from(10)
        .pow(decimals)
        .toString(),
    )
    if (nextFromValueString.toFixed().indexOf(".") !== -1) return false
    // 数值小于最大数量
    if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
    return true
  }

  const handleInputChange = (event, item) => {
    try {
      item.setValue(event.target.value)
    } catch (error) {
      item.setValue("")
    }
  }

  const handleMaxClick = (item) => {
    item.setValue(formatBalance(item.balance, item.decimals, { showAll: true }))
  }

  const getTokenAndAmonut = () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const nextTokens = []
    const nextAmounts = []
    if (isValidUsdtValue) {
      const nextUsdtValue = BigNumber.from(
        BN(usdtValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(usdtDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDT_ADDRESS)
    }
    if (isValidUsdcValue) {
      const nextUsdtValue = BigNumber.from(
        BN(usdcValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(usdcDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDC_ADDRESS)
    }
    if (isValidDaiValue) {
      const nextUsdtValue = BigNumber.from(
        BN(daiValue)
          .multipliedBy(
            BigNumber.from(10)
              .pow(daiDecimals)
              .toString(),
          )
          .toFixed(),
      )
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(DAI_ADDRESS)
    }
    return [nextTokens, nextAmounts]
  }

  const diposit = async () => {
    // 取款逻辑参考：https://github.com/PiggyFinance/piggy-finance-web/issues/178
    clearTimeout(loadingTimer.current)
    // step1: 校验三个币，起码一个有值
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    if (!isValidUsdtValue && !isValidUsdcValue && !isValidDaiValue) {
      return dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please enter the correct value",
        }),
      )
    }
    // step2：折算精度，授权三个币及数值
    setIsLoading(true)
    const [nextTokens, nextAmounts] = getTokenAndAmonut()
    console.log('nextTokens=', nextTokens, nextAmounts)
    const signer = userProvider.getSigner()
    for (const key in nextTokens) {
      const contract = new ethers.Contract(nextTokens[key], IERC20_ABI, userProvider)
      const contractWithUser = contract.connect(signer)
        // 获取当前允许的额度
      const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextAmounts[key].gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          console.log('补充allowance:', nextAmounts[key].sub(allowanceAmount).toString())
          await contractWithUser.increaseAllowance(VAULT_ADDRESS, nextAmounts[key].sub(allowanceAmount)).then(tx => tx.wait()).catch((e) => {
            // 如果是用户自行取消的，则直接返回
            if(e.code === 4001) {
              setIsLoading(false)
              return Promise.reject(e)
            }
            // 如果补齐失败，则需要使用最糟的方式，将allowance设置为0后，再设置成新的额度。
            return contractWithUser.approve(VAULT_ADDRESS, 0)
              .then(tx => tx.wait())
              .then(() => contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()))
          })
        } else {
          console.log("当前授权：", allowanceAmount.toString(), "准备授权：", nextAmounts[key].toString())
          await contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()).catch((e) => {
            // 如果是用户自行取消的，则直接返回
            if(e.code === 4001) {
              setIsLoading(false)
              return Promise.reject(e)
            }
          })
        }
      }
    }
    // step3: 存钱
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false
    await nVaultWithUser.mint(nextTokens, nextAmounts, 0)
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch((error) => {
        if (error && error.data) {
          const errorMsg = get(error.data, 'message', '')
          let tip = ''
          if (errorMsg.endsWith("'ES or AD'") || errorMsg.endsWith("'ES'")) {
            tip = 'Vault has been shut down, please try again later!'
          }
          if (errorMsg.endsWith("'AD'")) {
            tip = 'Vault is in adjustment status, please try again later!'
          }
          if (errorMsg.endsWith("'RP'")) {
            tip = 'Vault is in rebase status, please try again later!'
          }
          if (tip) {
            dispatch(
              warmDialog({
                open: true,
                type: "error",
                message: tip,
              }),
            )
          }
        }
        setIsLoading(false)
      })
    
    if (isSuccess) {
      setUsdtValue("")
      setUsdcValue("")
      setDaiValue("")
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
      setIsOpenEstimateModal(false)
      if (isSuccess) {
        dispatch(
          warmDialog({
            open: true,
            type: "success",
            message: "Success!",
          }),
        )
      }
    }, 2000)
  }

  /**
   * 
   */
  const openEstimateModal = () => {
    setIsOpenEstimateModal(true)
  }

  const estimateMint = debounce(async () => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const isFalse = (v) => v === false
    const [tokens, amounts] = getTokenAndAmonut()
    if (isFalse(isValidUsdtValue) || isFalse(isValidUsdcValue) || isFalse(isValidDaiValue) || tokens.length === 0) {
      setEstimateVaultBuffValue(BigNumber.from(0))
      return
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const result = await vaultContract.estimateMint(tokens, amounts)
    if (abi_version === 'beta-v1.5.9') {
      setEstimateVaultBuffValue(result)
    } else {
      setEstimateVaultBuffValue(result.priceAdjustedDeposit)
    }
  }, 500)

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line
  }, [usdcValue, usdtValue, daiValue])

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        {map(formConfig, (item) => (
          <GridItem key={item.name} xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.inputLabelWrapper}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.tokenLogo} alt='' src={item.image} />
                    <span className={classes.tokenName}>{item.name}</span>
                  </div> 
                  <Muted title={formatBalance(item.balance, item.decimals, { showAll: true })}>
                    {`Balance: ${formatBalance(item.balance, item.decimals)}`}
                  </Muted>
                </div>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <CustomTextField
                  value={item.value}
                  onChange={(event) => handleInputChange(event, item)}
                  placeholder="deposit amount"
                  maxEndAdornment
                  onMaxClick={() => handleMaxClick(item)}
                  error={!isUndefined(item.isValid) && !item.isValid}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
        ))}
        { 
          abi_version === 'beta-v1.5.9'
            ? <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.depositComfirmArea}>
                  <Muted>
                    <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                      Estimated:
                      &nbsp;{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}
                      &nbsp;USDi Ticket
                    </p>
                  </Muted>
                  <Button
                    disabled={!isLogin || (isLogin && (
                      some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)
                    ))}
                    color='colorfull'
                    onClick={openEstimateModal}
                    style={{ minWidth: 122, padding: "12px 16px", margin: "6px 0" }}
                  >
                    Deposit
                  </Button>
                </div>
              </GridItem>
          : <GridItem xs={12} sm={12} md={12} lg={12}>
            <div className={classes.depositComfirmArea}>
              <Muted>
                <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                  Estimated:
                  &nbsp;{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}
                  &nbsp;USDi
                </p>
              </Muted>
              <Button
                disabled={!isLogin || (isLogin && (
                  some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)
                ))}
                color='colorfull'
                onClick={diposit}
                style={{ minWidth: 122, padding: "12px 16px", margin: "6px 0" }}
              >
                Deposit
              </Button>
            </div>
          </GridItem>
        }
      </GridContainer>
      <Modal
        className={classes.modal}
        open={isOpenEstimateModal}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          style={{
            padding: 20,
            maxWidth: '600px',
            color: "rgba(255,255,255, 0.87)",
            border: "1px solid",
            background: "#150752",
          }}
        >
          <BocStepper
            classes={{
              root: classes.root,
            }}
            alternativeLabel
            activeStep={4}
            connector={<BocStepConnector />}
          >
            {map(steps, (i, index) => {
              return (
                <Step key={index}>
                  <BocStepLabel StepIconComponent={BocStepIcon}>{i}</BocStepLabel>
                </Step>
              )
            })}
          </BocStepper>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Typography variant="subtitle1" gutterBottom>
                Deposit Amounts: {reduce(map(formConfig, item => {
                  const { name, value, image, isValid, address } = item 
                  if (!isValid) {
                    return
                  }
                  return <span key={address} className={classes.flexText}>
                    <span style={{ color: 'chocolate', marginRight: 5 }}>{value}</span> {name} <img className={classes.ModalTokenLogo} alt='' src={image} />
                  </span> 
                }),(rs, i, index) => {
                  if(isEmpty(i)) {
                    return rs
                  }
                  if(!isEmpty(rs)){
                    rs.push(<span key={index}> + </span>)
                  }
                  rs.push(i)
                  return rs
                } , [])}
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Typography variant="subtitle1" gutterBottom>
                Estimate User Get: <span style={{ color: 'darkturquoise'}}> + {toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))} </span> USDi Tickets
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Typography variant="subtitle1" gutterBottom>
                Exchange&nbsp;
                <Tooltip
                  classes={{
                    tooltip: classes.tooltip
                  }}
                  placement='top'
                  title='Estimated amount of USDi that can be exchanged'
                >
                  <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                </Tooltip>: From <span style={{ color: 'chocolate'}}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(usdiDecimals))}</span> USDi Tickets <span style={{ fontWeight: 'bold', color: 'dimgrey' }}>To</span> <span style={{ color: 'darkturquoise'}}>
                  {toFixed(estimateVaultBuffValue.mul(9987).div(10000), BigNumber.from(10).pow(usdiDecimals), 2)}
                </span> USDi
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Typography variant="subtitle1" gutterBottom>
                Exchange Time&nbsp;
                <Tooltip
                  classes={{
                    tooltip: classes.tooltip
                  }}
                  placement='top'
                  title='The latest planned execution date may not be executed due to cost and other factors'
                >
                  <InfoIcon classes={{ root: classes.labelToolTipIcon }} />
                </Tooltip>: <span style={{ color: 'chocolate'}}>{moment(nextRebaseTime).format("YYYY-MM-DD HH:mm:ss")}</span>
              </Typography>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12} style={{ textAlign: 'center', paddingTop: 30 }}>
              <Button
                color='colorfull'
                onClick={diposit}
              >
                Continue
              </Button>
              <MButton
                style={{ marginLeft: 20, borderRadius: 12, padding: '12px 30px' }}
                variant="contained"
                color="secondary"
                onClick={() => setIsOpenEstimateModal(false)}
              >
                Cancel
              </MButton>
            </GridItem>
          </GridContainer>
        </Paper>
      </Modal>
      <Modal
        className={classes.modal}
        open={isLoading}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <Paper
          elevation={3}
          style={{
            padding: 20,
            minWidth: 430,
            color: "rgba(255,255,255, 0.87)",
            border: "1px solid",
            background: "#150752",
          }}
        >
          <div className={classes.modalBody}>
            <CircularProgress color='inherit' />
            <p>On Deposit...</p>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
