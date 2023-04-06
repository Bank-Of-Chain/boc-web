import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import Step from '@material-ui/core/Step'
import WarningIcon from '@material-ui/icons/Warning'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import CustomTextField from '@/components/CustomTextField'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import Loading from '@/components/LoadingComponent'
import ApproveArrayV3 from '@/components/ApproveArray/ApproveArrayV3'
import SimpleSelect from '@/components/SimpleSelect'

// === Hooks === //
import useVault from '@/hooks/useVault'
import useWallet from '@/hooks/useWallet'
import { warmDialog } from '@/reducers/meta-reducer'
import useRedeemFeeBps from '@/hooks/useRedeemFeeBps'
import usePriceProvider from '@/hooks/usePriceProvider'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import get from 'lodash/get'
import debounce from 'lodash/debounce'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import { isValid } from '@/helpers/number'
import { toFixed, formatBalance } from '@/helpers/number-format'
import { isAd, isEs, isRp, isMaxLoss, isLossMuch, isExchangeFail, errorTextOutput } from '@/helpers/error-handler'

// === Constants === //
import { ETH_ADDRESS, WETH_ADDRESS } from '@/constants/tokens'
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT, IERC20_ABI } from '@/constants'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'
import { BN_18 } from '@/constants/big-number'
import { ETHI_FOR_ETH as ETHI_ADDRESS, ETHI_VAULT as VAULT_ADDRESS } from '@/config/config'
import { VAULT_ABI_V2_0 as VAULT_ABI } from '@/constants/abi'

// === Styles === //
import styles from './style'
import { some } from 'lodash'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [{ title: 'Shares Validation' }, { title: 'Gas Estimates' }, { title: 'Withdraw' }]

const WITHDRAW_EXCHANGE_THRESHOLD = BigNumber.from(10).pow(16)

const Withdraw = () => {
  //  EXCHANGE_AGGREGATOR_ABI, EXCHANGE_ADAPTER_ABI, PRICE_ORCALE_ABI
  const EXCHANGE_AGGREGATOR_ABI = [],
    EXCHANGE_ADAPTER_ABI = [],
    PRICE_ORCALE_ABI = []

  const classes = useStyles()
  const dispatch = useDispatch()
  const [toValue, setToValue] = useState('')
  const [allowMaxLoss, setAllowMaxLoss] = useState('0.3')
  const [slipper, setSlipper] = useState('0.3')
  const [estimateWithdrawArray, setEstimateWithdrawArray] = useState([])
  const [isEstimate, setIsEstimate] = useState(false)
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [withdrawError, setWithdrawError] = useState({})
  const loadingTimer = useRef()

  const [burnTokens, setBurnTokens] = useState([
    // {
    //   address: ETH_ADDRESS,
    //   amount: '10000000000000000000',
    //   symbol: 'ETH'
    // },
    // {
    //   address: WETH_ADDRESS,
    //   amount: '1000000000000000000',
    //   symbol: 'WETH'
    // }
  ])
  console.log('WETH_ADDRESS=', WETH_ADDRESS, JSON.stringify(burnTokens))
  const [isShowZipModal, setIsShowZipModal] = useState(false)

  const { userProvider } = useWallet()

  const address = useUserAddress(userProvider)

  const { value: redeemFeeBps } = useRedeemFeeBps({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI
  })

  const { getPriceProvider } = usePriceProvider({
    userProvider,
    VAULT_ADDRESS,
    VAULT_ABI,
    PRICE_ORCALE_ABI
  })

  const {
    balance: ethiBalance,
    decimals: ethiDecimals,
    loading: isEthiLoading,
    queryBalance: queryEthiBalance
  } = useErc20Token(ETHI_ADDRESS, userProvider)

  const { pegTokenPrice, getPegTokenPrice, exchangeManager } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider)

  const isValidToValueFlag = isValid(toValue, ethiDecimals, ethiBalance)

  const redeemFeeBpsPercent = redeemFeeBps.toNumber() / 100

  /**
   * check if allow loss is valid
   * @returns
   */
  const isValidAllowLoss = useCallback(() => {
    if (allowMaxLoss === '' || isEmpty(allowMaxLoss.replace(/ /g, ''))) return
    if (isNaN(allowMaxLoss)) return false
    if (allowMaxLoss < 0 || allowMaxLoss > 50) return false
    return true
  }, [allowMaxLoss])

  /**
   *
   */
  const estimateWithdraw = useCallback(
    debounce(async () => {
      setIsEstimate(true)
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(ethiDecimals).toString()).toFixed())
      const usdValue = nextValue.mul(pegTokenPrice).div(BN_18.toFixed())
      const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
        .mul(usdValue)
        .div(BigNumber.from(1e4))
      const signer = userProvider.getSigner()
      const vaultContractWithSigner = vaultContract.connect(signer)

      try {
        const [tokens, amounts] = await vaultContractWithSigner.callStatic.burn(nextValue, allowMaxLossValue)
        console.log('estimate withdraw result:', tokens, amounts)
        let nextEstimateWithdrawArray = compact(
          await Promise.all(
            map(tokens, async (token, index) => {
              const tokenContract = new ethers.Contract(token, IERC20_ABI, userProvider)
              const amount = get(amounts, index, BigNumber.from(0))
              if (amount.gt(0)) {
                if (token === ETH_ADDRESS) {
                  return {
                    tokenAddress: token,
                    decimals: ethiDecimals,
                    symbol: 'ETH',
                    balance: await userProvider.getBalance(address),
                    amounts: amount
                  }
                }
                return {
                  tokenAddress: token,
                  decimals: await tokenContract.decimals(),
                  symbol: await tokenContract.symbol(),
                  balance: await tokenContract.balanceOf(address),
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
        let tip = errorMsg
        if (isEs(errorMsg)) {
          tip = 'Vault has been shut down, please try again later!'
        } else if (isAd(errorMsg)) {
          tip = 'Vault is in adjustment status, please try again later!'
        } else if (isRp(errorMsg)) {
          tip = 'Vault is in rebase status, please try again later!'
        } else if (isMaxLoss(errorMsg)) {
          tip = 'Failed to withdraw, please increase the Max Loss!'
        } else if (isLossMuch(errorMsg)) {
          tip = 'Failed to exchange, please increase the exchange slippage!'
        } else if (isExchangeFail(errorMsg)) {
          tip = 'Failed to exchange, Please try again later!'
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
    }, 1500),
    [toValue, pegTokenPrice, VAULT_ADDRESS, VAULT_ABI, userProvider, allowMaxLoss, address, dispatch, ethiDecimals, redeemFeeBpsPercent]
  )

  /**
   *
   */
  const handleBurn = useCallback(
    async (tokens, amounts) => {
      console.log('handleBurn')
      console.log('tokens', tokens)
      console.log(
        'amounts',
        amounts.map(el => el.toString())
      )
      const priceProvider = await getPriceProvider()
      return Promise.all(
        map(tokens, async (token, i) => {
          const amount = toFixed(amounts[i], 1)
          const amountsInEth = await priceProvider.valueInEth(token, amount)
          if (WITHDRAW_EXCHANGE_THRESHOLD.gt(amountsInEth)) {
            return
          }

          let balance = BigNumber.from(0)
          let tokenSymbol = 'ETH'
          if (token === ETH_ADDRESS) {
            balance = await userProvider.getBalance(address)
          } else {
            const contract = new ethers.Contract(token, IERC20_ABI, userProvider)
            balance = await contract.balanceOf(address)
            tokenSymbol = await contract.symbol()
          }

          return {
            address: token,
            amount: balance.gt(amounts[i]) ? amount : balance.toString(),
            symbol: tokenSymbol
          }
        })
      ).then(array => {
        const nextBurnTokens = compact(array)
        if (
          some(nextBurnTokens, i => {
            return i.address !== ETH_ADDRESS && i.amount !== '0'
          })
        ) {
          setBurnTokens(nextBurnTokens)
          setIsShowZipModal(true)
        }
      })
    },
    [userProvider, address, getPriceProvider]
  )

  /**
   *
   */
  const withdraw = useCallback(async () => {
    clearTimeout(loadingTimer.current)
    let withdrawTimeStart = Date.now(),
      withdrawValidFinish = 0,
      preWithdrawGetCoins = 0,
      getSwapInfoFinish = 0,
      estimateGasFinish = 0,
      withdrawFinish = 0,
      withdrawTransationFinish = 0
    setIsWithdrawLoading(true)
    console.log('----------start withdraw----------')
    if (!isValidToValueFlag) {
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

    withdrawValidFinish = Date.now()
    setCurrentStep(1)
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const signer = userProvider.getSigner()
    const nextValue = BigNumber.from(BN(toValue).multipliedBy(BigNumber.from(10).pow(ethiDecimals).toString()).toFixed())
    const usdValue = nextValue.mul(pegTokenPrice).div(BN_18.toFixed())
    const allowMaxLossValue = BigNumber.from(10000 - parseInt(100 * (parseFloat(allowMaxLoss) + redeemFeeBpsPercent)))
      .mul(usdValue)
      .div(BigNumber.from(1e4))
    try {
      const vaultContractWithSigner = vaultContract.connect(signer)

      getSwapInfoFinish = Date.now()
      setCurrentStep(2)
      let tx, resp
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithSigner.estimateGas.burn(nextValue, allowMaxLossValue)
        setCurrentStep(3)
        estimateGasFinish = Date.now()
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        resp = await vaultContractWithSigner.callStatic.burn(nextValue, allowMaxLossValue, {
          gasLimit: maxGasLimit
        })
        tx = await vaultContractWithSigner.burn(nextValue, allowMaxLossValue, {
          gasLimit: maxGasLimit
        })
      } else {
        resp = await vaultContractWithSigner.callStatic.burn(nextValue, allowMaxLossValue)
        tx = await vaultContractWithSigner.burn(nextValue, allowMaxLossValue)
      }
      withdrawFinish = Date.now()

      console.log('tx=', tx, 'tx.hash=', tx.hash, 'resp=', resp)
      // if user add gas in metamask, next code runs error, and return a new transaction.
      const isSuccess = await tx.wait().catch(error => {
        const { code, replacement, cancelled, reason, receipt } = error
        console.log('code=', code)
        console.log('replacement=', replacement)
        console.log('cancelled=', cancelled)
        console.log('reason=', reason)
        console.log('receipt=', receipt)

        // if error due to 'TRANSACTION_REPLACED'
        // we should wait the replacement transaction commit before we close the modal
        if (code === TRANSACTION_REPLACED) {
          if (cancelled) {
            return
          }
          const replaceTransaction = replacement
          console.log('replaceTx=', replaceTransaction, replaceTransaction.hash)
          return replaceTransaction.wait()
        } else if (code === CALL_EXCEPTION) {
          dispatch(
            warmDialog({
              open: true,
              type: 'error',
              message: reason
            })
          )
          return false
        }
      })
      if (isUndefined(isSuccess)) {
        dispatch(
          warmDialog({
            open: true,
            type: 'warning',
            message: 'Cancelled!'
          })
        )
        loadingTimer.current = setTimeout(() => {
          setIsWithdrawLoading(false)
          setWithdrawError({})
          setCurrentStep(0)
        }, 2000)
        return
      }
      if (isSuccess === false) {
        loadingTimer.current = setTimeout(() => {
          setIsWithdrawLoading(false)
          setWithdrawError({})
          setCurrentStep(0)
        }, 2000)
        return
      }
      handleBurn(...resp)

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
        tip = 'Failed to exchange, please increase the exchange slippage!'
      } else if (isExchangeFail(errorMsg)) {
        tip = 'Failed to exchange, Please try again later!'
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
    loadingTimer.current = setTimeout(() => {
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
  }, [
    toValue,
    ethiDecimals,
    VAULT_ADDRESS,
    VAULT_ABI,
    userProvider,
    allowMaxLoss,
    dispatch,
    handleBurn,
    isValidAllowLoss,
    isValidToValueFlag,
    pegTokenPrice,
    redeemFeeBpsPercent
  ])

  useEffect(() => {
    if (isEmpty(toValue) || !isValidToValueFlag || !isValidAllowLoss()) {
      setEstimateWithdrawArray([])
      return
    }
    // need open advanced setting
    // allowLoss, toValue need valid
    estimateWithdraw()
    return () => {
      setEstimateWithdrawArray([])
      return estimateWithdraw.cancel()
    }
  }, [toValue, allowMaxLoss, estimateWithdraw, isValidAllowLoss, isValidToValueFlag])

  const handleAmountChange = useCallback(event => {
    try {
      setToValue(event.target.value)
    } catch (error) {
      setToValue('')
    }
  }, [])

  /**
   *
   */
  const handleMaxClick = useCallback(async () => {
    const nextEthiBalance = await queryEthiBalance()
    setToValue(formatBalance(nextEthiBalance, ethiDecimals, { showAll: true }))
  }, [queryEthiBalance, ethiDecimals])

  /**
   *
   * @returns
   */
  const renderEstimate = () => {
    if (isEstimate) {
      return (
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateItem}>
            <CircularProgress fontSize="large" color="primary" />
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

    const options = map(estimateWithdrawArray, item => {
      return {
        label: item.symbol,
        value: item.tokenAddress,
        img: `./images/${item.tokenAddress}.png`
      }
    })

    return map(estimateWithdrawArray, item => {
      return (
        <GridItem key={item.tokenAddress} xs={12} sm={12} md={12} lg={12} style={{ paddingTop: '0.5rem' }}>
          <GridContainer justify="center" spacing={1}>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <SimpleSelect disabled value={item.tokenAddress} options={options} />
            </GridItem>
            <GridItem xs={8} sm={8} md={8} lg={8}>
              <CustomTextField
                classes={{ root: classes.input }}
                value={toFixed(item.amounts, BigNumber.from(10).pow(item.decimals), 6)}
                placeholder="withdraw amount"
                disabled
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <p className={classes.estimateText} title={formatBalance(item.balance, item.decimals, { showAll: true })}>
                Balance:&nbsp; {formatBalance(item.balance, item.decimals)}
              </p>
            </GridItem>
          </GridContainer>
        </GridItem>
      )
    })
  }

  const isValidAllowLossFlag = isValidAllowLoss()

  const isLogin = !isEmpty(userProvider)

  useEffect(() => {
    getPegTokenPrice()
    const timer = setInterval(getPegTokenPrice, 10000)
    return () => clearInterval(timer)
  }, [getPegTokenPrice])

  const handleBurnCall = useCallback(() => queryEthiBalance(), [queryEthiBalance])

  useEffect(() => {
    const listener = () => {
      if (isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI) || isEmpty(userProvider)) return
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      vaultContract.on('Burn', handleBurnCall)
      return () => {
        vaultContract.off('Burn', handleBurnCall)
      }
    }
    return listener()
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider, handleBurnCall])

  return (
    <GridContainer>
      <GridItem xs={6} sm={6} md={6} lg={6}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <GridContainer justify="center" spacing={2}>
              <GridItem xs={4} sm={4} md={4} lg={4}>
                <div className={classes.tokenInfo}>
                  <span className={classes.tokenName}>ETHi</span>
                </div>
              </GridItem>
              <GridItem xs={8} sm={8} md={8} lg={8}>
                <CustomTextField
                  classes={{ root: classes.input }}
                  value={toValue}
                  placeholder="withdraw amount"
                  maxEndAdornment
                  onMaxClick={() => handleMaxClick()}
                  onChange={handleAmountChange}
                  error={!isUndefined(isValidToValueFlag) && !isValidToValueFlag && toValue !== '0'}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
          <GridItem xs={6} sm={6} md={6} lg={6}>
            <p className={classes.estimateText} title={formatBalance(ethiBalance, ethiDecimals, { showAll: true })}>
              Balance:&nbsp;
              <Loading loading={isEthiLoading}>{formatBalance(ethiBalance, ethiDecimals)}</Loading>
            </p>
          </GridItem>
          {address && (
            <GridItem xs={6} sm={6} md={6} lg={6}>
              <p className={classes.estimateText} style={{ justifyContent: 'flex-end' }} title={toFixed(pegTokenPrice, BN_18)}>
                <span>1ETHi ≈ {toFixed(pegTokenPrice, BN_18, 6)}ETH</span>
              </p>
            </GridItem>
          )}
        </GridContainer>
        <GridContainer>
          <GridItem xs={4} sm={4} md={4} className={classes.slippageTitle}>
            Max Slippage(%):
          </GridItem>
          <GridItem xs={8} sm={8} md={8}>
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
        <GridContainer className="mt-3">
          <GridItem xs={7} sm={7} md={7} lg={7}>
            <Button
              disabled={!isLogin || (isLogin && (isUndefined(isValidToValueFlag) || !isValidToValueFlag))}
              color="colorful"
              onClick={withdraw}
              className={classes.blockButton}
              fullWidth={true}
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
          </GridItem>
          <GridItem xs={1} sm={1} md={1} lg={1}></GridItem>
          <GridItem xs={4} sm={4} md={4} lg={4}>
            <Button color="colorful" fullWidth onClick={withdraw} className={classes.blockButton}>
              Zap
            </Button>
          </GridItem>
        </GridContainer>
      </GridItem>
      <GridItem xs={6} sm={6} md={6} lg={6} className="pl-12">
        <p className={classes.estimateText}>To receive:</p>
        {renderEstimate()}
      </GridItem>
      <Modal className={classes.modal} open={isWithdrawLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.widthdrawLoadingPaper}>
          <div className={classes.modalBody}>
            <div className={classes.itemTop}>
              {isEmpty(withdrawError) ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span className={classes.text}>Withdrawing...</span>
                </>
              ) : (
                <div>Withdraw Error !</div>
              )}
            </div>
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
              fullWidth={true}
              className={classes.cancelButton}
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
            <ApproveArrayV3
              isEthi
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
    </GridContainer>
  )
}

export default Withdraw
