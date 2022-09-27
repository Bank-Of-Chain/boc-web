import React, { useState, useEffect, useCallback } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import AddIcon from '@material-ui/icons/Add'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import Step from '@material-ui/core/Step'
import WarningIcon from '@material-ui/icons/Warning'
import Box from '@material-ui/core/Box'
import SimpleSelect from '@/components/SimpleSelect'
import CustomTextField from '@/components/CustomTextField'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import Popover from '@material-ui/core/Popover'
import Loading from '@/components/LoadingComponent'
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state'
import ApproveArray from '@/components/ApproveArray/ApproveArrayV2'

// === Constants === //
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import { addToken } from '@/helpers/wallet'
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, IERC20_ABI, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { BN_18 } from '@/constants/big-number'

// === Hooks === //
import useRedeemFeeBps from '@/hooks/useRedeemFeeBps'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import { isAd, isEs, isRp, isMaxLoss, isLossMuch, isExchangeFail, errorTextOutput } from '@/helpers/error-handler'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [{ title: 'Shares Validation' }, { title: 'Gas Estimates' }, { title: 'Withdraw' }]

const RECEIVE_MIX_VALUE = 'Mix'

export default function Withdraw({
  address,
  toBalance,
  usdiDecimals,
  userProvider,
  VAULT_ADDRESS,
  VAULT_ABI,
  EXCHANGE_AGGREGATOR_ABI,
  exchangeManager,
  EXCHANGE_ADAPTER_ABI,
  isBalanceLoading,
  reloadBalance
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [receiveToken, setReceiveToken] = useState(RECEIVE_MIX_VALUE)
  const [toValue, setToValue] = useState('')
  const [allowMaxLoss, setAllowMaxLoss] = useState('0.3')
  const [slipper, setSlipper] = useState('0.3')
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})

  const [burnTokens, setBurnTokens] = useState([
    // {
    //   address: USDT_ADDRESS,
    //   amount: '100000000'
    // },
    // {
    //   address: USDC_ADDRESS,
    //   amount: '10000000'
    // },
    {
      address: DAI_ADDRESS,
      amount: '10000000000000000000'
    }
  ])
  const [isShowZipModal, setIsShowZipModal] = useState(true)
  const [pegTokenPrice, setPegTokenPrice] = useState(BN_18)

  const { value: redeemFeeBps } = useRedeemFeeBps({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI
  })

  const redeemFeeBpsPercent = redeemFeeBps.toNumber() / 100

  const shouldExchange = receiveToken !== RECEIVE_MIX_VALUE
  const token = shouldExchange ? receiveToken : USDT_ADDRESS

  const estimateWithdraw = useCallback(
    debounce(async () => {
      setIsEstimate(true)
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(usdiDecimals).toString()).toFixed())
      const usdValue = nextValue.mul(pegTokenPrice).div(BN_18.toFixed())
      const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
        .mul(usdValue)
        .div(BigNumber.from(1e4))
      const signer = userProvider.getSigner()
      const vaultContractWithSigner = vaultContract.connect(signer)

      try {
        let [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(nextValue, allowMaxLossValue)
        console.log(
          'tokens, amounts=',
          tokens,
          map(amounts, i => i.toString())
        )

        let nextEstimateWithdrawArray = compact(
          await Promise.all(
            map(tokens, async (token, index) => {
              const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
              const amount = get(amounts, index, BigNumber.from(0))
              if (amount.gt(0)) {
                return {
                  tokenAddress: token,
                  decimals: await tokenContract.decimals(),
                  amounts: amount
                }
              }
            })
          )
        )

        setEstimateWithdrawArray(nextEstimateWithdrawArray)
      } catch (error) {
        console.log('estimate withdraw error', error)
        const errorMsg = errorTextOutput(error)
        let tip = ''
        if (isEs(errorMsg)) {
          tip = 'Vault has been shut down, please try again later!'
        } else if (isAd(errorMsg)) {
          tip = 'Vault is in adjustment status, please try again later!'
        } else if (isRp(errorMsg)) {
          tip = 'Vault is in rebase status, please try again later!'
        } else if (isMaxLoss(errorMsg)) {
          tip = 'Failed to withdraw, please increase the Max Loss!'
        } else if (isLossMuch(errorMsg)) {
          tip = 'Failed to exchange, please increase the exchange slippage or choose mixed token!'
        } else if (isExchangeFail(errorMsg)) {
          tip = 'Failed to exchange, Please try again later or choose mixed token!'
        } else {
          tip = errorMsg
        }
        dispatch(
          warmDialog({
            open: true,
            type: 'error',
            message: tip
          })
        )
        setEstimateWithdrawArray(undefined)
      } finally {
        setTimeout(() => {
          setIsEstimate(false)
        }, 500)
      }
    }, 1500)
  )

  const handleBurn = (a, b, c, d, tokens, amounts) => {
    console.log('handleBurn')
    console.log('tokens', tokens)
    console.log(
      'amounts',
      amounts.map(el => el.toString())
    )
    return Promise.all(
      map(tokens, async (token, i) => {
        const fromContract = new ethers.Contract(token, IERC20_ABI, userProvider)
        const fromDecimal = await fromContract.decimals()
        const exchangeAmounts = amounts[i]
        if (BigNumber.from(10).pow(fromDecimal).gt(exchangeAmounts)) {
          return
        }
        return {
          address: token,
          amount: toFixed(amounts[i], 1)
        }
      })
    ).then(array => {
      const nextBurnTokens = compact(array)
      if (!isEmpty(nextBurnTokens)) {
        setBurnTokens(nextBurnTokens)
        setIsShowZipModal(true)
      }
    })
  }

  const withdraw = async () => {
    let withdrawTimeStart = Date.now(),
      withdrawValidFinish = 0,
      preWithdrawGetCoins = 0,
      getSwapInfoFinish = 0,
      estimateGasFinish = 0,
      withdrawFinish = 0,
      withdrawTransationFinish = 0
    setIsWithdrawLoading(true)
    console.log('----------start withdraw----------')
    if (!isValidToValue()) {
      return setWithdrawError({
        type: 'warning',
        message: 'Please enter the correct value.'
      })
    }

    if (!isValidAllowLoss()) {
      return setWithdrawError({
        type: 'warning',
        message: 'Enter the correct Max Loss value.'
      })
    }

    if (shouldExchange && !isValidSlipper()) {
      return setWithdrawError({
        type: 'warning',
        message: 'Please enter the correct slippage value.'
      })
    }
    withdrawValidFinish = Date.now()
    setCurrentStep(1)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(usdiDecimals).toString()).toFixed())
    const usdValue = nextValue.mul(pegTokenPrice).div(BN_18.toFixed())
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
      .mul(usdValue)
      .div(BigNumber.from(1e4))
    try {
      const vaultContractWithSigner = vaultContract.connect(signer)
      getSwapInfoFinish = Date.now()
      setCurrentStep(2)
      let tx
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.burn(nextValue, allowMaxLossValue)
        setCurrentStep(3)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        tx = await vaultContractWithSigner.burn(nextValue, allowMaxLossValue, {
          gasLimit: maxGasLimit
        })
      } else {
        tx = await vaultContractWithSigner.burn(nextValue, allowMaxLossValue)
      }
      withdrawFinish = Date.now()

      const { events } = await tx.wait()
      let args = []
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].event === 'Burn') {
          args = events[i].args
          break
        }
      }
      handleBurn(...args)

      withdrawTransationFinish = Date.now()
      setCurrentStep(4)
      setToValue('')
      dispatch(
        warmDialog({
          open: true,
          type: 'success',
          message: 'Success!'
        })
      )
    } catch (error) {
      console.log('withdraw original error :', error)
      const errorMsg = errorTextOutput(error)
      let tip = ''
      if (isEs(errorMsg)) {
        tip = 'Vault has been shut down, please try again later!'
      } else if (isAd(errorMsg)) {
        tip = 'Vault is in adjustment status, please try again later!'
      } else if (isRp(errorMsg)) {
        tip = 'Vault is in rebase status, please try again later!'
      } else if (isMaxLoss(errorMsg)) {
        tip = 'Failed to withdraw, please increase the Max Loss!'
      } else if (isLossMuch(errorMsg)) {
        tip = 'Failed to exchange, please increase the exchange slippage or choose mixed token!'
      } else if (isExchangeFail(errorMsg)) {
        tip = 'Failed to exchange, Please try again later or choose mixed token!'
      } else {
        tip = errorMsg
      }
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message: tip
        })
      )
    }
    setTimeout(() => {
      setIsWithdrawLoading(false)
      setWithdrawError({})
      setCurrentStep(0)
    }, 2000)
    // log withdraw total time
    const totalTime = withdrawTransationFinish - withdrawTimeStart
    const szjy = withdrawValidFinish - withdrawTimeStart
    const szjyPercents = ((100 * szjy) / totalTime).toFixed(2)
    const ytq = preWithdrawGetCoins === 0 ? 0 : preWithdrawGetCoins - withdrawValidFinish
    const ytqPercents = ((100 * ytq) / totalTime).toFixed(2)
    const hqdhlj = preWithdrawGetCoins === 0 ? getSwapInfoFinish - withdrawValidFinish : getSwapInfoFinish - preWithdrawGetCoins
    const hqdhljPercents = ((100 * hqdhlj) / totalTime).toFixed(2)
    const eg = estimateGasFinish === 0 ? 0 : estimateGasFinish - getSwapInfoFinish
    const egPercents = ((100 * eg) / totalTime).toFixed(2)
    const qk = estimateGasFinish === 0 ? withdrawFinish - getSwapInfoFinish : withdrawFinish - estimateGasFinish
    const qkPercents = ((100 * qk) / totalTime).toFixed(2)
    const swc = withdrawTransationFinish - withdrawFinish
    const swcPercents = ((100 * swc) / totalTime).toFixed(2)
    console.table({
      valid: `${szjy}(${szjyPercents}%)`,
      preWithdraw: `${ytq}(${ytqPercents}%)`,
      getSwapPath: `${hqdhlj}(${hqdhljPercents}%)`,
      estimateGas: `${eg}(${egPercents}%)`,
      withdraw: `${qk}(${qkPercents}%)`,
      transaction: `${swc}(${swcPercents}%)`
    })
  }

  function imgError(e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = '/default.png'
  }

  const handleReceiveTokenChange = value => {
    setReceiveToken(value)
  }

  /**
   * check if toValue is valid
   * @returns
   */
  const isValidToValue = () => {
    if (toValue === '' || toValue === '-' || isEmpty(toValue.replace(/ /g, ''))) return
    // should be a number
    if (isNaN(Number(toValue))) return false
    const nextValue = BN(toValue)
    const nextToValue = nextValue.multipliedBy(BigNumber.from(10).pow(usdiDecimals).toString())
    // should be positive
    if (nextToValue.lte(0)) return false
    // should be integer
    const nextToValueString = nextValue.multipliedBy(BigNumber.from(10).pow(usdiDecimals).toString())
    if (nextToValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (toBalance.lt(BigNumber.from(nextToValue.toFixed()))) return false
    return true
  }

  /**
   * check if allow loss is valid
   * @returns
   */
  const isValidAllowLoss = () => {
    if (allowMaxLoss === '' || isEmpty(allowMaxLoss.replace(/ /g, ''))) return
    if (isNaN(allowMaxLoss)) return false
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false
    return true
  }

  const isValidSlipper = () => {
    if (slipper === '' || isEmpty(slipper.replace(/ /g, ''))) return
    if (isNaN(slipper)) return false
    if (slipper < 0 || slipper > 45) return false
    return true
  }

  useEffect(() => {
    // need open advanced setting
    // allowLoss, slipper, toValue need valid
    if (isValidAllowLoss() && isValidSlipper() && isValidToValue()) {
      estimateWithdraw()
    }
    if (isEmpty(toValue)) {
      setEstimateWithdrawArray([])
      setIsEstimate(false)
    }
    return () => {
      setEstimateWithdrawArray([])
      return estimateWithdraw.cancel()
    }
  }, [toValue, allowMaxLoss, slipper, shouldExchange, token])

  const handleAmountChange = event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue('')
    }
  }

  const handleMaxClick = async () => {
    const [nextUsdiBalance] = await reloadBalance()
    setToValue(formatBalance(nextUsdiBalance, usdiDecimals, { showAll: true }))
  }

  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <CircularProgress fontSize="large" />
            <p>loading...</p>
          </div>
        </GridItem>
      )
    }
    if (isUndefined(estimateWithdrawArray)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <ErrorOutlineIcon fontSize="large" />
            <p>Amount estimate failed, please try again!</p>
          </div>
        </GridItem>
      )
    }
    if (isEmpty(estimateWithdrawArray) || isEmpty(toValue)) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <p style={{ fontSize: 26, textAlign: 'right' }}>0.00</p>
          </div>
        </GridItem>
      )
    }
    return map(estimateWithdrawArray, item => {
      return (
        <GridItem key={item.tokenAddress} xs={12} sm={12} md={6} lg={6}>
          <Button
            title="Add token address to wallet"
            color="transparent"
            target="_blank"
            style={{ fontSize: '1rem', color: '#A0A0A0' }}
            onClick={() => addToken(item.tokenAddress)}
          >
            <AddIcon fontSize="small" style={{ position: 'absolute', top: 25, left: 45 }} />
            <img className={classes.img} style={{ borderRadius: '50%' }} alt="" src={`./images/${item.tokenAddress}.png`} onError={imgError} />
            &nbsp;&nbsp;~&nbsp;
            {toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
          </Button>
        </GridItem>
      )
    })
  }

  const selectOptions = [
    {
      label: 'USDT',
      value: USDT_ADDRESS || 'USDT',
      img: './images/0x55d398326f99059fF775485246999027B3197955.png'
    },
    {
      label: 'USDC',
      value: USDC_ADDRESS || 'USDC',
      img: './images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png'
    },
    {
      label: 'DAI',
      value: DAI_ADDRESS || 'DAI',
      img: './images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png'
    },
    {
      label: 'Mix',
      value: RECEIVE_MIX_VALUE || 'Mix',
      img: [
        './images/0x55d398326f99059fF775485246999027B3197955.png',
        './images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
        './images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png'
      ]
    }
  ]

  const isValidToValueFlag = isValidToValue()
  const isValidAllowLossFlag = isValidAllowLoss()

  const isLogin = !isEmpty(userProvider)

  const getPegTokenPrice = () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    vaultContract.getPegTokenPrice().then(result => {
      setTimeout(() => {
        setPegTokenPrice(result)
      }, 500)
    })
    return getPegTokenPrice
  }

  useEffect(() => {
    if (isEmpty(address) || isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI)) return
    const timer = setInterval(getPegTokenPrice(), 1000000)
    return () => clearInterval(timer)
  }, [address, VAULT_ADDRESS, VAULT_ABI])

  return (
    <>
      <div className={classes.setting}>
        <PopupState variant="popover" popupId="setting-popover">
          {popupState => (
            <div>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...bindTrigger(popupState)}>
                <path
                  d="M15 20.625C18.1066 20.625 20.625 18.1066 20.625 15C20.625 11.8934 18.1066 9.375 15 9.375C11.8934 9.375 9.375 11.8934 9.375 15C9.375 18.1066 11.8934 20.625 15 20.625Z"
                  stroke="#A0A0A0"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.5273 7.62891C21.8242 7.90234 22.1055 8.18359 22.3711 8.47266L25.5703 8.92969C26.0916 9.83497 26.4934 10.804 26.7656 11.8125L24.8203 14.4023C24.8203 14.4023 24.8555 15.1992 24.8203 15.5977L26.7656 18.1875C26.4946 19.1965 26.0928 20.1656 25.5703 21.0703L22.3711 21.5273C22.3711 21.5273 21.8203 22.1016 21.5273 22.3711L21.0703 25.5703C20.165 26.0916 19.196 26.4934 18.1875 26.7656L15.5977 24.8203C15.2 24.8555 14.8 24.8555 14.4023 24.8203L11.8125 26.7656C10.8035 26.4946 9.83438 26.0928 8.92969 25.5703L8.47266 22.3711C8.18359 22.0977 7.90234 21.8164 7.62891 21.5273L4.42969 21.0703C3.90842 20.165 3.50663 19.196 3.23438 18.1875L5.17969 15.5977C5.17969 15.5977 5.14453 14.8008 5.17969 14.4023L3.23438 11.8125C3.50537 10.8035 3.90722 9.83438 4.42969 8.92969L7.62891 8.47266C7.90234 8.18359 8.18359 7.90234 8.47266 7.62891L8.92969 4.42969C9.83497 3.90842 10.804 3.50663 11.8125 3.23438L14.4023 5.17969C14.8 5.14452 15.2 5.14452 15.5977 5.17969L18.1875 3.23438C19.1965 3.50537 20.1656 3.90722 21.0703 4.42969L21.5273 7.62891Z"
                  stroke="#A0A0A0"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Popover
                classes={{ paper: classes.popover }}
                {...bindPopover(popupState)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
              >
                <Box p={2}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12} lg={12}>
                      <p className={classes.popoverTitle}>Max Loss</p>
                      <CustomTextField
                        classes={{ root: classes.input }}
                        value={allowMaxLoss}
                        placeholder="Allow loss percent"
                        maxEndAdornment
                        onMaxClick={() => setAllowMaxLoss('50')}
                        onChange={event => {
                          const value = event.target.value
                          setAllowMaxLoss(value)
                        }}
                        error={!isUndefined(isValidAllowLossFlag) && !isValidAllowLossFlag}
                      />
                    </GridItem>
                  </GridContainer>
                </Box>
              </Popover>
            </div>
          )}
        </PopupState>
      </div>
      <GridContainer className={classes.withdrawContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>From</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.inputLabelWrapper}>
            <div className={classes.tokenInfo}>
              <span className={classes.tokenName}>USDi</span>
            </div>
            <CustomTextField
              classes={{ root: classes.input }}
              value={toValue}
              placeholder="withdraw amount"
              maxEndAdornment
              onMaxClick={() => handleMaxClick()}
              onChange={handleAmountChange}
              error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== '0'}
            />
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText} title={formatBalance(toBalance, usdiDecimals, { showAll: true })}>
            Balance:&nbsp;
            <Loading loading={isBalanceLoading}>{formatBalance(toBalance, usdiDecimals)}</Loading>
          </p>
        </GridItem>
        {address && (
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <p className={classes.estimateText} title={toFixed(pegTokenPrice, BN_18)}>
              <span>1 USDi ≈ {toFixed(pegTokenPrice, BN_18, 6)} USD</span>
            </p>
          </GridItem>
        )}
      </GridContainer>
      <GridContainer className={classes.outputContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.selectorlWrapper}>
            <SimpleSelect disabled value={receiveToken} onChange={handleReceiveTokenChange} options={selectOptions} />
            <p className={classes.estimateText}>
              {receiveToken === 'Mix' && (
                <Tooltip
                  classes={{
                    tooltip: classes.tooltip
                  }}
                  placement="top"
                  title={'Mix mode will return a variety of coins, such as USDT/USDC/TUSD/BUSD, etc.'}
                >
                  <InfoIcon />
                </Tooltip>
              )}
            </p>
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <GridContainer>{renderEstimate()}</GridContainer>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button
              disabled={!isLogin || (isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag))}
              color="colorfull"
              onClick={withdraw}
              style={{ width: '100%' }}
            >
              Withdraw
              <Tooltip
                classes={{
                  tooltip: classes.tooltip
                }}
                placement="top"
                title={`${redeemFeeBpsPercent}% withdrawal fee of the principal.`}
              >
                <InfoIcon style={{ marginLeft: '0.5rem' }} />
              </Tooltip>
            </Button>
          </div>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isWithdrawLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.widthdrawLoadingPaper}>
          <div className={classes.modalBody}>
            {isEmpty(withdrawError) && <CircularProgress color="inherit" />}
            {isEmpty(withdrawError) ? <p>In Withdrawing...</p> : <p>Withdraw Error !</p>}
            <BocStepper
              classes={{
                root: classes.root
              }}
              alternativeLabel
              activeStep={currentStep}
              connector={<BocStepConnector />}
            >
              {map(steps, (i, index) => {
                return (
                  <Step key={index}>
                    <BocStepLabel StepIconComponent={BocStepIcon}>{i.title}</BocStepLabel>
                  </Step>
                )
              })}
            </BocStepper>
            {!isEmpty(withdrawError) && (
              <p
                style={{
                  color: withdrawError.type === 'error' ? 'red' : 'yellow'
                }}
              >
                <WarningIcon style={{ verticalAlign: 'bottom' }}></WarningIcon>
                &nbsp;&nbsp;&nbsp;{withdrawError.message}
              </p>
            )}
            <Button
              color="danger"
              onClick={() => {
                setIsWithdrawLoading(false)
                setWithdrawError({})
                setCurrentStep(0)
              }}
            >
              Cancel
            </Button>
          </div>
        </Paper>
      </Modal>
      <Modal
        className={classes.modal}
        open={isShowZipModal && !!address}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.swapBody}>
          {!isEmpty(address) && !isEmpty(exchangeManager) && (
            <ApproveArray
              address={address}
              tokens={burnTokens}
              userProvider={userProvider}
              exchangeManager={exchangeManager}
              EXCHANGE_ADAPTER_ABI={EXCHANGE_ADAPTER_ABI}
              EXCHANGE_AGGREGATOR_ABI={EXCHANGE_AGGREGATOR_ABI}
              slippage={slipper}
              onSlippageChange={setSlipper}
              handleClose={() => setIsShowZipModal(false)}
            />
          )}
        </div>
      </Modal>
    </>
  )
}
