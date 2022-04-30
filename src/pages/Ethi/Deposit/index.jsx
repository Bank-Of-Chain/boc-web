import React, { useState, useEffect, useRef } from "react"
import * as ethers from "ethers"
import BN from "bignumber.js"
import { useDispatch } from "react-redux"
import isUndefined from "lodash/isUndefined"
import debounce from "lodash/debounce"
import isEmpty from "lodash/isEmpty"
import get from "lodash/get"
import { makeStyles } from "@material-ui/core/styles"
import CircularProgress from "@material-ui/core/CircularProgress"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"

import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"
import CustomTextField from "../../../components/CustomTextField"
import Muted from "../../../components/Typography/Muted"
import Button from "../../../components/CustomButtons/Button"
import { warmDialog } from "./../../../reducers/meta-reducer"
import { formatBalance } from "../../../helpers/number-format"

import styles from "./style"

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  address,
  ethBalance,
  ethDecimals,
  userProvider,
  onConnect,
  VAULT_ABI,
  IERC20_ABI,
  VAULT_ADDRESS,
  ETH_ADDRESS
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState("")
  const [estimateValue, setEstimateValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimer = useRef()

  /**
   * 校验value是否为有效输入
   * @returns
   */
  function isValidValue() {
    const balance = ethBalance
    const decimals = ethDecimals
    const value = ethValue
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

  const handleInputChange = (event) => {
    setEthValue(event.target.value)
  }

  const handleMaxClick = () => {
    setEthValue(formatBalance(ethBalance, ethDecimals, { showAll: true }))
  }

  const diposit = async () => {
    // 取款逻辑参考：https://github.com/PiggyFinance/piggy-finance-web/issues/178
    clearTimeout(loadingTimer.current)
    // step1: 校验三个币，起码一个有值
    const isValid = isValidValue()
    if (!isValid) {
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
    const nextTokens = []
    const nextAmounts = []
    const nextUsdtValue = BigNumber.from(
      BN(ethValue)
        .multipliedBy(
          BigNumber.from(10)
            .pow(ethDecimals)
            .toString(),
        )
        .toFixed(),
    )
    nextAmounts.push(nextUsdtValue)
    nextTokens.push(ETH_ADDRESS)
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
      setEthValue("")
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
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

  const estimateMint = debounce(async () => {
    setEstimateValue(0)
  }, 500)


  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line
  }, [ethValue])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt='' src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                  <span className={classes.tokenName}>ETH</span>
                </div> 
                <Muted title={formatBalance(ethBalance, ethDecimals, { showAll: true })}>
                  {`Balance: ${formatBalance(ethBalance, ethDecimals)}`}
                </Muted>
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <CustomTextField
                value={ethValue}
                onChange={handleInputChange}
                placeholder="deposit amount"
                maxEndAdornment
                onMaxClick={handleMaxClick}
                error={!isUndefined(isValid) && !isValid}
              />
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.depositComfirmArea}>
            <Muted>
              <p style={{ fontSize: 16, wordBreak: "break-all", letterSpacing: "0.01071em" }}>
                Estimated:
                &nbsp;{estimateValue}
                &nbsp;ETHi
              </p>
            </Muted>
            <Button
              disabled={isLogin && (!isUndefined(isValid) && !isValid)}
              color='colorfull'
              onClick={isLogin ? diposit : onConnect}
              style={{ minWidth: 122, padding: "12px 16px", margin: "6px 0" }}
            >
              {isLogin ? "Deposit" : "Connect Wallet"}
            </Button>
          </div>
        </GridItem>
      </GridContainer>
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
