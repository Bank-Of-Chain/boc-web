import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Step from '@material-ui/core/Step'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Loading from '@/components/LoadingComponent'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'

// === Utils === //
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import { isValid as isValidNumber } from '@/helpers/number'

// === Hooks === //
import useVault from '@/hooks/useVault'
import useWallet from '@/hooks/useWallet'
import { useAsync } from 'react-async-hook'
import useMetaMask from '@/hooks/useMetaMask'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'

// === Constants === //
import { ETH_ADDRESS } from '@/constants/tokens'
import { BN_18 } from '@/constants/big-number'
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT, RPC_URL } from '@/constants'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'
import { ETHI_VAULT as VAULT_ADDRESS, VAULT_BUFFER_FOR_ETHI_ETH as VAULT_BUFFER_ADDRESS } from '@/config/config'
import { VAULT_ABI_V2_0 as VAULT_ABI } from '@/constants/abi'

// === Styles === //
import styles from './style'

const { BigNumber, providers } = ethers
const useStyles = makeStyles(styles)

const steps = [
  <>
    <div>Step1:</div>
    <div>Deposit</div>
  </>,
  'Pending ETH',
  <>
    <div>Step2:</div>
    <div>Allocation</div>
  </>,
  'Get ETHi'
]

const Deposit = props => {
  const { reload } = props
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [, setIsEstimate] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const { userProvider } = useWallet()

  const provider = useMemo(() => new providers.StaticJsonRpcProvider(RPC_URL[1], 1), [RPC_URL])
  const { minimumInvestmentAmount, redeemFeeBps, trusteeFeeBps } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider || provider)

  const { gasPrice, gasPriceLoading } = useMetaMask(userProvider)

  const address = useUserAddress(userProvider)
  const {
    balance: ethBalance,
    decimals: ethDecimals,
    loading: isEthLoading,
    queryBalance: queryEthBalance
  } = useErc20Token(ETH_ADDRESS, userProvider)
  const {
    // balance: vaultBufferBalance,
    decimals: vaultBufferDecimals,
    queryBalance: queryVaultBufferBalance
  } = useErc20Token(VAULT_BUFFER_ADDRESS, userProvider)

  const isValid = isValidNumber(ethValue, ethDecimals, ethBalance)

  const { loading: gasLimitLoading, result: mintGasLimit = BigNumber.from(0) } = useAsync(() => {
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI)) {
      return BigNumber.from(0)
    }
    const amount = isValid
      ? BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
      : BigNumber.from(10).pow(ethDecimals)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    return nVaultWithUser.estimateGas.mint([ETH_ADDRESS], [amount], 0, {
      from: address,
      value: amount
    })
  }, [userProvider, VAULT_ADDRESS, VAULT_ABI, ethBalance, ethDecimals, address, ethValue, isValid])

  const getGasFee = useCallback(
    flag => {
      if (gasPriceLoading || gasLimitLoading || (!isValid && isUndefined(flag))) {
        return BigNumber.from(0)
      }
      // metamask gaslimit great than contract gaslimit, so add extra limit
      const metamaskExtraLimit = 114
      return mintGasLimit.add(metamaskExtraLimit).mul(BigNumber.from(gasPrice.toString()))
    },
    [gasPrice, gasPriceLoading, mintGasLimit, gasLimitLoading, isValid]
  )

  const handleInputChange = event => {
    setIsEstimate(true)
    setEthValue(event.target.value)
  }

  /**
   *
   * @returns
   */
  const handleMaxClick = useCallback(() => {
    const v = getGasFee(true)
    if (v.lte(0)) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Since the latest Gasprice is not available, it is impossible to estimate the gas fee currently!'
        })
      )
      return
    }
    const maxValue = ethBalance.sub(v)
    const maxBalance = formatBalance(maxValue.gt(0) ? maxValue : 0, ethDecimals, {
      showAll: true
    })
    if (maxValue === ethValue) {
      return
    }
    setIsEstimate(true)
    setEthValue(maxBalance)
  }, [getGasFee, ethBalance, dispatch, ethDecimals, ethValue])

  /**
   *
   */
  const deposit = useCallback(async () => {
    clearTimeout(loadingTimer.current)
    if (!isValid) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please enter the correct value'
        })
      )
    }
    setIsLoading(true)
    const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
    console.log('nextTokens=', ETH_ADDRESS, amount)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)

    const errorHandle = error => {
      const errorMsg = errorTextOutput(error)
      let tip = errorMsg
      if (isEs(errorMsg)) {
        tip = 'Vault has been shut down, please try again later!'
      } else if (isAd(errorMsg)) {
        tip = 'Vault is in adjustment status, please try again later!'
      } else if (isRp(errorMsg)) {
        tip = 'Vault is in rebase status, please try again later!'
      } else if (isDistributing(errorMsg)) {
        tip = 'Vault is in distributing, please try again later!'
      } else if (isLessThanMinValue(errorMsg)) {
        tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}ETH!`
      } else {
        tip = errorMsg
      }
      if (tip) {
        dispatch(
          warmDialog({
            open: true,
            type: 'error',
            message: tip
          })
        )
      }
      setIsLoading(false)
      return false
    }
    const extendObj = {}
    // if gasLimit times not 1, need estimateGas
    if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
      const gas = await nVaultWithUser.estimateGas.mint([ETH_ADDRESS], [amount], 0, { from: address, value: amount }).catch(e => {
        errorHandle(e)
        return
      })
      if (isUndefined(gas)) return
      const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
      // gasLimit not exceed maximum
      const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
      extendObj.gasLimit = maxGasLimit
    }
    const isSuccess = await nVaultWithUser
      .mint([ETH_ADDRESS], [amount], 0, {
        ...extendObj,
        from: address,
        value: amount
      })
      .then(tx => {
        // if user add gas in metamask, next code runs error, and return a new transaction.
        return tx
          .wait()
          .then(() => {
            return true
          })
          .catch(error => {
            console.log('TRANSACTION_REPLACED=', error, Object.keys(error))
            const { code, replacement, cancelled, reason, receipt } = error
            console.log('code=', code)
            console.log('replacement=', replacement)
            console.log('cancelled=', cancelled)
            console.log('reason=', reason)
            console.log('receipt=', receipt)
            // if error due to 'TRANSACTION_REPLACED'
            // we should wait the replacement transaction commit before we close the modal
            if (code === TRANSACTION_REPLACED) {
              // if user add gas for tx canceled, return undefined
              if (cancelled) {
                return
              }
              const replaceTransaction = replacement
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
      })
      .catch(errorHandle)

    console.log('isSuccess=', isSuccess)
    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
      setIsOpenEstimateModal(false)
      if (isUndefined(isSuccess)) {
        dispatch(
          warmDialog({
            open: true,
            type: 'warning',
            message: 'Cancelled!'
          })
        )
        return
      }
      if (isSuccess) {
        setEthValue('')
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Success!'
          })
        )
      }
    }, 2000)
  }, [ethValue, ethDecimals, VAULT_ADDRESS, VAULT_ABI, userProvider, isValid, address, dispatch, minimumInvestmentAmount])

  const estimateMint = useCallback(
    debounce(async () => {
      if (!isValid) {
        setIsEstimate(false)
        setEstimateVaultBuffValue(BigNumber.from(0))
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
      const result = await vaultContract.estimateMint([ETH_ADDRESS], [amount]).catch(error => {
        const errorMsg = errorTextOutput(error)
        let tip = ''
        if (isEs(errorMsg)) {
          tip = 'Vault has been shut down, please try again later!'
        } else if (isAd(errorMsg)) {
          tip = 'Vault is in adjustment status, please try again later!'
        } else if (isRp(errorMsg)) {
          tip = 'Vault is in rebase status, please try again later!'
        } else if (isDistributing(errorMsg)) {
          tip = 'Vault is in distributing, please try again later!'
        } else if (isLessThanMinValue(errorMsg)) {
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}ETH!`
        } else {
          tip = errorMsg
        }
        if (tip) {
          dispatch(
            warmDialog({
              open: true,
              type: 'error',
              message: tip
            })
          )
        }
        return BigNumber.from(0)
      })
      setEstimateVaultBuffValue(result)
      setIsEstimate(false)
    }, 1500),
    [VAULT_ADDRESS, VAULT_ABI, userProvider, ethValue, isValid]
  )

  /**
   *
   */
  const openEstimateModal = () => {
    setIsOpenEstimateModal(true)
  }

  const handleMint = useCallback(() => {
    queryEthBalance()
    queryVaultBufferBalance()
    reload()
  }, [reload, queryEthBalance, queryVaultBufferBalance])

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
  }, [estimateMint])

  useEffect(() => {
    if (isEmpty(VAULT_ABI) || isEmpty(userProvider) || isEmpty(VAULT_ABI)) return
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    vaultContract.on('Mint', handleMint)
    return () => {
      vaultContract.off('Mint', handleMint)
    }
  }, [VAULT_ADDRESS, VAULT_ABI, userProvider, handleMint])

  const isLogin = !isEmpty(userProvider)

  return (
    <>
      <GridContainer>
        <GridItem xs={6} sm={12} md={6} lg={6} className="p-8 pb-0">
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <GridContainer>
                <GridItem xs={4} sm={4} md={4} lg={4}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.tokenLogo} alt="" src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                    <span className={classes.tokenName}>ETH</span>
                  </div>
                </GridItem>
                <GridItem xs={8} sm={8} md={8} lg={8} className="px-4">
                  <CustomTextField
                    classes={{ root: classes.input }}
                    value={ethValue}
                    onChange={handleInputChange}
                    placeholder="deposit amount"
                    maxEndAdornment
                    onMaxClick={handleMaxClick}
                    error={!isUndefined(isValid) && !isValid}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={12} lg={12} className="pt-2">
                  <span
                    className="color-neutral-500"
                    title={formatBalance(ethBalance, ethDecimals, {
                      showAll: true
                    })}
                  >
                    Balance:&nbsp;&nbsp;
                    <Loading loading={isEthLoading}>{formatBalance(ethBalance, ethDecimals)}</Loading>
                  </span>
                </GridItem>
                <GridItem xs={12} sm={12} md={12} lg={12} className="pt-2">
                  <span className="color-neutral-500">
                    Estimated Gas Fee:&nbsp;
                    <Loading loading={gasPriceLoading} className="v-btm">
                      <span>{toFixed(getGasFee(), BigNumber.from(10).pow(ethDecimals), 6)} ETH</span>
                    </Loading>
                  </span>
                </GridItem>
              </GridContainer>
            </GridItem>
          </GridContainer>
          <GridContainer className="mt-8 pr-4">
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Button
                disabled={!isLogin || (isLogin && !isValid)}
                color="colorful"
                onClick={openEstimateModal}
                className={classes.blockButton}
                fullWidth={true}
              >
                Deposit
              </Button>
            </GridItem>
          </GridContainer>
        </GridItem>
        <GridItem xs={6} sm={12} md={6} lg={6} className="pl-12" style={{ borderLeft: '1px solid #737373' }}>
          <p className="color-neutral-500">performance fee: {toFixed(trusteeFeeBps, 100, 2)}%</p>
          <p className="color-neutral-500">withdraw fee: {toFixed(redeemFeeBps, 100, 2)}%</p>
          <p className="color-neutral-500">
            You can put any ratio and any amount of ETH into the Vault, the protocol will invest your funds in each protocol at the next rebalancing.
          </p>
          <p>
            <span className="color-fuchsia-700">pending:</span>
            <span className="color-neutral-500 ml-2">Wait for the rebalance to complete the share distribution.(T + 1)</span>
          </p>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isOpenEstimateModal} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <BocStepper
            classes={{
              root: classes.root
            }}
            alternativeLabel
            activeStep={1}
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
          <div className={classes.item}>
            <div className={classes.title}>Deposit Amounts:</div>
            <div className={classes.tokens}>
              <div className={classes.token}>
                <img className={classes.ModalTokenLogo} alt="" src="/images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png" />
                <span className={classes.name}>ETH: </span>
                <span className={classes.name}>{ethValue}</span>
              </div>
            </div>
          </div>
          <div className={classes.itemBottom}>
            <div className={classes.exchangeInfo}>
              Valuation:
              <span className={classes.usdiInfo}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(vaultBufferDecimals), 2)}</span>ETH
            </div>
          </div>
          <div className={classes.buttonGroup}>
            <Button className={classes.cancelButton} color="danger" onClick={() => setIsOpenEstimateModal(false)}>
              Cancel
            </Button>
            <Button className={classes.okButton} color="colorful" onClick={deposit}>
              Continue
            </Button>
          </div>
        </Paper>
      </Modal>
      <Modal className={classes.modal} open={isLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <div className={classes.modalBody}>
            <CircularProgress color="inherit" />
            <p>On Deposit...</p>
          </div>
        </Paper>
      </Modal>
    </>
  )
}

export default Deposit
