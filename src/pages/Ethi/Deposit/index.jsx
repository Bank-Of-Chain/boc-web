import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Step from '@material-ui/core/Step'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Loading from '@/components/LoadingComponent'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import Snackbar from '@/components/Snackbar'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Icon from '@material-ui/core/Icon'
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck'
import CancelIcon from '@material-ui/icons/Cancel'

// === Hooks === //
import useMetaMask from '@/hooks/useMetaMask'

// === Utils === //
import compact from 'lodash/compact'
import { getLastPossibleRebaseTime } from '@/helpers/time-util'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import { short } from '@/helpers/string-utils'
import { isValid as isValidNumber } from '@/helpers/number'

// === Hooks === //
import { useAsync } from 'react-async-hook'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'

// === Constants === //
import { CHAIN_BROWSER_URL, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { ETH_ADDRESS } from '@/constants/tokens'
import { BN_18 } from '@/constants/big-number'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

const steps = [
  <>
    <div>Step1:</div>
    <div>Deposit</div>
  </>,
  'Get ETHi Ticket',
  <>
    <div>Step2:</div>
    <div>Allocation</div>
  </>,
  'Get ETHi'
]

const Deposit = ({ userProvider, VAULT_ABI, VAULT_ADDRESS, minimumInvestmentAmount, VAULT_BUFFER_ADDRESS }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [, setIsLoading] = useState(false)
  const [isEstimate, setIsEstimate] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(true)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const nextRebaseTime = getLastPossibleRebaseTime()

  const { gasPrice, gasPriceLoading, transactions, addListenHash, removeListenHash, queryTransactions } = useMetaMask(userProvider)

  const address = useUserAddress(userProvider)
  const {
    balance: ethBalance,
    decimals: ethDecimals,
    loading: isEthLoading,
    queryBalance: queryEthBalance
  } = useErc20Token(ETH_ADDRESS, userProvider)
  const {
    balance: vaultBufferBalance,
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
    return nVaultWithUser.estimateGas.mint(ETH_ADDRESS, amount, 0, {
      from: address,
      value: amount
    })
  }, [userProvider, VAULT_ADDRESS, VAULT_ABI, ethBalance, ethDecimals, address, ethValue, isValid])

  console.log('gasPrice=', gasPrice, gasLimitLoading, mintGasLimit)

  const getGasFee = useCallback(() => {
    if (gasPriceLoading || gasLimitLoading) {
      return BigNumber.from(0)
    }
    // metamask gaslimit great than contract gaslimit, so add extra limit
    const metamaskExtraLimit = 114
    return mintGasLimit.add(metamaskExtraLimit).mul(BigNumber.from(gasPrice.toString()))
  }, [gasPrice, gasPriceLoading, mintGasLimit, gasLimitLoading])

  const handleInputChange = event => {
    setIsEstimate(true)
    setEthValue(event.target.value)
  }

  /**
   *
   * @returns
   */
  const handleMaxClick = useCallback(() => {
    const v = getGasFee()
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

    const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
    console.log('nextTokens=', ETH_ADDRESS, amount)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false

    const errorHandle = error => {
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
    }
    const extendObj = {}
    // if gasLimit times not 1, need estimateGas
    if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
      const gas = await nVaultWithUser.estimateGas.mint(ETH_ADDRESS, amount, 0, { from: address, value: amount }).catch(errorHandle)
      if (isUndefined(gas)) return
      const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
      // gasLimit not exceed maximum
      const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
      extendObj.gasLimit = maxGasLimit
    }
    const tx = await nVaultWithUser
      .mint(ETH_ADDRESS, amount, 0, {
        ...extendObj,
        from: address,
        value: amount
      })
      .then(v => {
        setIsLoading(true)
        return v
      })
      .catch(errorHandle)
    if (!isEmpty(tx)) {
      addListenHash(tx.hash)
      await tx.wait()
      queryTransactions()
      isSuccess = true
    }

    loadingTimer.current = setTimeout(() => {
      // removeListenHash(transactionHash)
      setIsLoading(false)
      setIsOpenEstimateModal(false)
      setEthValue('')
      if (isSuccess) {
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Success!'
          })
        )
      }
    }, 2000)
  }, [
    ethValue,
    ethDecimals,
    VAULT_ADDRESS,
    VAULT_ABI,
    userProvider,
    isValid,
    addListenHash,
    address,
    dispatch,
    minimumInvestmentAmount,
    queryTransactions
  ])

  const estimateMint = useCallback(
    debounce(async () => {
      if (!isValid) {
        setIsEstimate(false)
        setEstimateVaultBuffValue(BigNumber.from(0))
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(ethDecimals).toString()).toFixed())
      const result = await vaultContract.estimateMint(ETH_ADDRESS, amount).catch(error => {
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
  }, [queryEthBalance, queryVaultBufferBalance])

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
      <GridContainer spacing={3}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.wrapper}>
            <GridContainer classes={{ root: classes.depositContainer }}>
              <p className={classes.estimateText}>From</p>
              <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <GridContainer justify="center" spacing={2}>
                      <GridItem xs={4} sm={4} md={4} lg={4}>
                        <div className={classes.tokenInfo}>
                          <img className={classes.tokenLogo} alt="" src={`./images/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE.png`} />
                          <span className={classes.tokenName}>ETH</span>
                        </div>
                      </GridItem>
                      <GridItem xs={8} sm={8} md={8} lg={8}>
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
                    </GridContainer>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12} lg={12}>
                    <div
                      className={classes.balance}
                      title={formatBalance(ethBalance, ethDecimals, {
                        showAll: true
                      })}
                    >
                      Balance:&nbsp;&nbsp;
                      <Loading loading={isEthLoading}>{formatBalance(ethBalance, ethDecimals)}</Loading>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
            <GridContainer classes={{ root: classes.estimateContainer }}>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <p className={classes.estimateText}>To</p>
                <div className={classes.estimateBalanceTitle}>
                  ETHi Ticket
                  <span className={classes.estimateBalanceNum}>
                    <Loading loading={isEstimate}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(vaultBufferDecimals))}</Loading>
                  </span>
                </div>
                <p className={classes.estimateText}>
                  <span>Balances&nbsp;:</span>
                  <span>{toFixed(vaultBufferBalance, BigNumber.from(10).pow(vaultBufferDecimals), 4)} ETH</span>
                </p>
                <p className={classes.estimateText}>
                  <span>Estimated Gas Fee&nbsp;:</span>
                  <Loading loading={gasPriceLoading}>
                    <span>{toFixed(getGasFee(), BigNumber.from(10).pow(ethDecimals), 6)} ETH</span>
                  </Loading>
                </p>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.tip}>
                  ETHi Ticket functions as parallel ETHi that will be converted into ETHi after fund allocations have been successful. Last execution
                  time was {moment(nextRebaseTime).format('yyyy-MM-DD HH:mm')}
                </div>
              </GridItem>
              {isEmpty(VAULT_ADDRESS) && (
                <GridItem xs={12} sm={12} md={12} lg={12}>
                  <p style={{ textAlign: 'center', color: 'red' }}>Switch to the ETH chain firstly!</p>
                </GridItem>
              )}
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <div className={classes.footerContainer}>
                  <Button
                    disabled={!isLogin || (isLogin && !isValid)}
                    color="colorful"
                    onClick={openEstimateModal}
                    className={classes.blockButton}
                    fullWidth={true}
                  >
                    Deposit
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
          </div>
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
              Receive:
              <span className={classes.usdiInfo}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(vaultBufferDecimals), 2)}</span>ETHi Tickets
            </div>
          </div>
          <div className={classes.buttonGroup}>
            <Button className={classes.cancelButton} color="danger" onClick={() => setIsOpenEstimateModal(false)}>
              Cancel
            </Button>
            <Button className={classes.okButton} color="colorful" onClick={deposit}>
              Continue ({toFixed(mintGasLimit.mul(gasPrice.toString()), BigNumber.from(10).pow(ethDecimals), 6)} ETH)
            </Button>
          </div>
        </Paper>
      </Modal>
      {map(compact(transactions), (item, index) => {
        const { transactionHash, status } = item
        const isPending = status === '0x0'
        const isSuccess = status === '0x1'
        return (
          <Snackbar key={transactionHash} index={index} close={() => removeListenHash(transactionHash)}>
            <div style={{ display: 'flex' }}>
              <Icon
                style={{ color: '#a68efd' }}
                onClick={() => window.open(`${CHAIN_BROWSER_URL}/tx/${transactionHash}`)}
                component={OpenInNewIcon}
                fontSize="small"
              ></Icon>
              <span style={{ color: '#BEBEBE' }}>&nbsp;{short(transactionHash, 8, 6)}&nbsp;</span>
              <Loading loading={isPending}>
                {isSuccess ? (
                  <Icon style={{ color: '#55E752' }} component={PlaylistAddCheckIcon} fontSize="small"></Icon>
                ) : (
                  <Icon style={{ color: '#f50057' }} component={CancelIcon} fontSize="small"></Icon>
                )}
              </Loading>
            </div>
          </Snackbar>
        )
      })}
    </>
  )
}

export default Deposit
