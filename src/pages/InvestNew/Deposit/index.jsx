import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Utils === //
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { useDispatch } from 'react-redux'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import some from 'lodash/some'
import every from 'lodash/every'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import compact from 'lodash/compact'
import filter from 'lodash/filter'
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'

// === Components === //
import Step from '@material-ui/core/Step'
import BocStepper from '@/components/Stepper/Stepper'
import BocStepLabel from '@/components/Stepper/StepLabel'
import BocStepIcon from '@/components/Stepper/StepIcon'
import BocStepConnector from '@/components/Stepper/StepConnector'
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'
import Loading from '@/components/LoadingComponent'
import SimpleSelect from '@/components/SimpleSelect/SimpleSelectV2'
import AddIcon from '@material-ui/icons/Add'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ClearIcon from '@material-ui/icons/Clear'

// === Hooks === //
import useVault from '@/hooks/useVault'
import useWallet from '@/hooks/useWallet'
import useErc20Token from '@/hooks/useErc20Token'
import useUserAddress from '@/hooks/useUserAddress'

// === Constants === //
import { USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, IERC20_ABI, MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'
import { BN_18 } from '@/constants/big-number'
import { TRANSACTION_REPLACED, CALL_EXCEPTION } from '@/constants/metamask'
import { USDI_VAULT_FOR_ETH as VAULT_ADDRESS, VAULT_BUFFER_FOR_USDI_ETH as VAULT_BUFFER_ADDRESS } from '@/config/config'
import { VAULT_ABI_V2_0 as VAULT_ABI } from '@/constants/abi'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)
const TOKEN = {
  USDT: 'USDT',
  USDC: 'USDC',
  DAI: 'DAI'
}

const steps = [
  <>
    <div>Step1:</div>
    <div>Deposit</div>
  </>,
  'Get USDi Ticket',
  <>
    <div>Step2:</div>
    <div>Allocation</div>
  </>,
  'Get USDi'
]

const Deposit = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [usdtValue, setUsdtValue] = useState('')
  const [usdcValue, setUsdcValue] = useState('')
  const [daiValue, setDaiValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [, setIsEstimate] = useState(false)
  const [isOpenEstimateModal, setIsOpenEstimateModal] = useState(false)
  const [estimateVaultBuffValue, setEstimateVaultBuffValue] = useState(BigNumber.from(0))
  const loadingTimer = useRef()

  const [tokenSelect, setTokenSelect] = useState([USDT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS])

  const { userProvider } = useWallet()

  const { minimumInvestmentAmount, redeemFeeBps, trusteeFeeBps } = useVault(VAULT_ADDRESS, VAULT_ABI, userProvider)

  const address = useUserAddress(userProvider)

  const {
    balance: usdtBalance,
    decimals: usdtDecimals,
    loading: isUsdtLoading,
    queryBalance: queryUsdtBalance
  } = useErc20Token(USDT_ADDRESS, userProvider)

  const {
    balance: usdcBalance,
    decimals: usdcDecimals,
    loading: isUsdcLoading,
    queryBalance: queryUsdcBalance
  } = useErc20Token(USDC_ADDRESS, userProvider)

  const {
    balance: daiBalance,
    decimals: daiDecimals,
    loading: isDaiLoading,
    queryBalance: queryDaiBalance
  } = useErc20Token(DAI_ADDRESS, userProvider)

  const {
    // balance: vaultBufferBalance,
    decimals: vaultBufferDecimals,
    queryBalance: queryVaultBufferBalance
  } = useErc20Token(VAULT_BUFFER_ADDRESS, userProvider)

  const tokenBasicState = useMemo(() => {
    return {
      [TOKEN.USDT]: {
        value: usdtValue,
        balance: usdtBalance,
        decimals: usdtDecimals
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
  }, [usdtValue, usdtBalance, usdtDecimals, usdcValue, usdcBalance, usdcDecimals, daiValue, daiBalance, daiDecimals])

  /**
   * check if value is valid
   * @returns
   */
  const isValidValue = useCallback(
    token => {
      const { value, balance, decimals } = tokenBasicState[token]
      if (value === '' || value === '-' || value === '0' || isEmpty(value.replace(/ /g, ''))) return
      // not a number
      if (isNaN(Number(value))) return false
      const nextValue = BN(value)
      const nextFromValue = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
      // should be positive
      if (nextFromValue.lte(0)) return false
      // should be integer
      const nextFromValueString = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
      if (nextFromValueString.toFixed().indexOf('.') !== -1) return false
      // balance less than value
      if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false
      return true
    },
    [tokenBasicState]
  )

  const formConfig = [
    {
      name: TOKEN.USDT,
      address: USDT_ADDRESS,
      image: './images/0x55d398326f99059fF775485246999027B3197955.png',
      setValue: setUsdtValue,
      isValid: isValidValue(TOKEN.USDT),
      loading: isUsdtLoading,
      ...tokenBasicState[TOKEN.USDT]
    },
    {
      name: TOKEN.USDC,
      address: USDC_ADDRESS,
      image: './images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
      setValue: setUsdcValue,
      isValid: isValidValue(TOKEN.USDC),
      loading: isUsdcLoading,
      ...tokenBasicState[TOKEN.USDC]
    },
    {
      name: TOKEN.DAI,
      address: DAI_ADDRESS,
      image: './images/0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3.png',
      setValue: setDaiValue,
      isValid: isValidValue(TOKEN.DAI),
      loading: isDaiLoading,
      ...tokenBasicState[TOKEN.DAI]
    }
  ]

  const handleInputChange = (event, item) => {
    try {
      setIsEstimate(true)
      item.setValue(event.target.value)
    } catch (error) {
      item.setValue('')
    }
  }

  const handleMaxClick = item => {
    const { balance, decimals, value } = item
    const maxValue = formatBalance(balance, decimals, { showAll: true })
    if (maxValue === value) {
      return
    }
    setIsEstimate(true)
    item.setValue(maxValue)
  }

  const getTokenAndAmonut = useCallback(() => {
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    const nextTokens = []
    const nextAmounts = []
    if (tokenSelect.includes(USDT_ADDRESS) && isValidUsdtValue) {
      const nextUsdtValue = BigNumber.from(BN(usdtValue).multipliedBy(BigNumber.from(10).pow(usdtDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDT_ADDRESS)
    }
    if (tokenSelect.includes(USDC_ADDRESS) && isValidUsdcValue) {
      const nextUsdtValue = BigNumber.from(BN(usdcValue).multipliedBy(BigNumber.from(10).pow(usdcDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(USDC_ADDRESS)
    }
    if (tokenSelect.includes(DAI_ADDRESS) && isValidDaiValue) {
      const nextUsdtValue = BigNumber.from(BN(daiValue).multipliedBy(BigNumber.from(10).pow(daiDecimals).toString()).toFixed())
      nextAmounts.push(nextUsdtValue)
      nextTokens.push(DAI_ADDRESS)
    }
    return [nextTokens, nextAmounts]
  }, [isValidValue, usdtValue, usdtDecimals, usdcValue, usdcDecimals, daiValue, daiDecimals, tokenSelect])

  /**
   *
   */
  const deposit = useCallback(async () => {
    clearTimeout(loadingTimer.current)
    // step1: valid three tokens
    const isValidUsdtValue = isValidValue(TOKEN.USDT)
    const isValidUsdcValue = isValidValue(TOKEN.USDC)
    const isValidDaiValue = isValidValue(TOKEN.DAI)
    if (
      (tokenSelect.includes(USDT_ADDRESS) && isValidUsdtValue === false) ||
      (tokenSelect.includes(USDC_ADDRESS) && isValidUsdcValue === false) ||
      (tokenSelect.includes(DAI_ADDRESS) && isValidDaiValue === false)
    ) {
      return dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Please enter the correct value'
        })
      )
    }
    // step2: convert precision, approve three tokens
    setIsLoading(true)
    const [nextTokens, nextAmounts] = getTokenAndAmonut()
    console.log('nextTokens=', nextTokens, nextAmounts)
    const signer = userProvider.getSigner()
    for (const key in nextTokens) {
      const contract = new ethers.Contract(nextTokens[key], IERC20_ABI, userProvider)
      const contractWithUser = contract.connect(signer)
      // get allow amount
      const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
      // If deposit amount greater than allow amount, reset amount
      if (nextAmounts[key].gt(allowanceAmount)) {
        // If allowance equal 0, approve nextAmount, otherwise approve 0 and approve nextAmount
        if (allowanceAmount.gt(0)) {
          console.log('add allowance:', nextAmounts[key].sub(allowanceAmount).toString())
          await contractWithUser
            .increaseAllowance(VAULT_ADDRESS, nextAmounts[key].sub(allowanceAmount))
            .then(tx => tx.wait())
            .catch(e => {
              // cancel by user
              if (e.code === 4001) {
                setIsLoading(false)
                return Promise.reject(e)
              }
              // If increase failed, approve 0 and approve nextAmounts
              return contractWithUser
                .approve(VAULT_ADDRESS, 0)
                .then(tx => tx.wait())
                .then(() => contractWithUser.approve(VAULT_ADDRESS, nextAmounts[key]).then(tx => tx.wait()))
            })
        } else {
          console.log('current allowance:', allowanceAmount.toString(), 'next allowance:', nextAmounts[key].toString())
          await contractWithUser
            .approve(VAULT_ADDRESS, nextAmounts[key])
            .then(tx => tx.wait())
            .catch(e => {
              // cancel by user
              if (e.code === 4001) {
                setIsLoading(false)
                return Promise.reject(e)
              }
            })
        }
      }
    }

    // check approve values if not enough, must return
    const allowanceCheckers = await Promise.all(
      map(nextTokens, async (item, index) => {
        // console.log('nextTokens[item]=', nextTokens, item, nextTokens[item])
        const contract = new ethers.Contract(nextTokens[index], IERC20_ABI, userProvider)
        const contractWithUser = contract.connect(signer)
        // get allow amount
        const allowanceAmount = await contractWithUser.allowance(address, VAULT_ADDRESS)
        return allowanceAmount.gte(nextAmounts[index])
      })
    )
    if (some(allowanceCheckers, i => i === false)) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Insufficient approved amounts!'
        })
      )
      setIsLoading(false)
      return
    }

    // step3: deposit
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
        tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}USD!`
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
      const gas = await nVaultWithUser.estimateGas.mint(nextTokens, nextAmounts, 0).catch(e => {
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
      .mint(nextTokens, nextAmounts, 0, extendObj)
      .then(tx => {
        // if user add gas in metamask, next code runs error, and return a new transaction.
        return tx
          .wait()
          .then(() => {
            return true
          })
          .catch(error => {
            const { code, replacement, cancelled, reason } = error
            // if error due to 'TRANSACTION_REPLACED'
            // we should wait the replacement transaction commit before we close the modal
            if (code === TRANSACTION_REPLACED) {
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

    if (isSuccess) {
      setUsdtValue('')
      setUsdcValue('')
      setDaiValue('')
    }

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
        dispatch(
          warmDialog({
            open: true,
            type: 'success',
            message: 'Success!'
          })
        )
      }
    }, 2000)
  }, [dispatch, VAULT_ADDRESS, VAULT_ABI, userProvider, address, getTokenAndAmonut, isValidValue, minimumInvestmentAmount, tokenSelect])

  /**
   *
   */
  const openEstimateModal = () => {
    setIsOpenEstimateModal(true)
  }

  const addSelectToken = address => {
    if (!tokenSelect.includes(address)) {
      setTokenSelect([...tokenSelect, address])
    }
  }

  const removeSelectToken = address => {
    if (tokenSelect.includes(address)) {
      setTokenSelect(filter(tokenSelect, i => i !== address))
    }
  }

  const estimateMint = useCallback(
    debounce(async () => {
      const isValidUsdtValue = isValidValue(TOKEN.USDT)
      const isValidUsdcValue = isValidValue(TOKEN.USDC)
      const isValidDaiValue = isValidValue(TOKEN.DAI)
      const isFalse = v => v === false
      const [tokens, amounts] = getTokenAndAmonut()
      if (
        (tokenSelect.includes(USDT_ADDRESS) && isFalse(isValidUsdtValue)) ||
        (tokenSelect.includes(USDC_ADDRESS) && isFalse(isValidUsdcValue)) ||
        (tokenSelect.includes(DAI_ADDRESS) && isFalse(isValidDaiValue)) ||
        tokens.length === 0
      ) {
        setEstimateVaultBuffValue(BigNumber.from(0))
        setIsEstimate(false)
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const result = await vaultContract.estimateMint(tokens, amounts).catch(error => {
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
          tip = `Deposit Amount must be greater than ${toFixed(minimumInvestmentAmount, BN_18, 2)}USD!`
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
    [isValidValue, VAULT_ABI, VAULT_ADDRESS, dispatch, getTokenAndAmonut, minimumInvestmentAmount, tokenSelect, userProvider]
  )

  const handleMint = useCallback(() => {
    queryUsdtBalance()
    queryUsdcBalance()
    queryDaiBalance()
    queryVaultBufferBalance()
  }, [queryUsdtBalance, queryUsdcBalance, queryDaiBalance, queryVaultBufferBalance])

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
  }, [usdcValue, usdtValue, daiValue, estimateMint])

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
        <GridItem xs={6} sm={12} md={6} lg={6}>
          <GridContainer>
            {map(formConfig, item => {
              if (tokenSelect.includes(item.address)) {
                const addItem = compact(
                  map(formConfig, selectItem => {
                    if (!tokenSelect.includes(selectItem.address)) {
                      return {
                        label: selectItem.name,
                        value: selectItem.address,
                        img: `./images/${selectItem.address}.png`,
                        endDont: <AddIcon />
                      }
                    }
                  })
                )
                const selectOptions = [
                  {
                    key: 'expand',
                    label: item.name,
                    value: 'expand',
                    img: `./images/${item.address}.png`,
                    endDont: <ExpandLessIcon />
                  },
                  ...addItem
                ]
                if (tokenSelect.length > 1) {
                  selectOptions.push({
                    key: 'clear',
                    label: item.name,
                    value: 'clear',
                    img: `./images/${item.address}.png`,
                    endDont: <ClearIcon />
                  })
                }
                return (
                  <GridItem key={item.name} xs={12} sm={12} md={12} lg={12} className="pb-4">
                    <GridContainer>
                      <GridItem xs={4} sm={4} md={4} lg={4}>
                        <SimpleSelect
                          options={selectOptions}
                          value={'expand'}
                          onChange={v => {
                            if (v === 'expand') return
                            if (v === 'clear') {
                              removeSelectToken(item.address)
                              item.setValue('')
                              return
                            }
                            addSelectToken(v)
                          }}
                        />
                      </GridItem>
                      <GridItem xs={8} sm={8} md={8} lg={8} className="px-4">
                        <CustomTextField
                          classes={{ root: classes.input }}
                          value={item.value}
                          onChange={event => handleInputChange(event, item)}
                          placeholder="deposit amount"
                          maxEndAdornment
                          onMaxClick={() => handleMaxClick(item)}
                          error={!isUndefined(item.isValid) && !item.isValid}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={12} lg={12}>
                        <div
                          className="color-neutral-500 mt-2"
                          title={formatBalance(item.balance, item.decimals, {
                            showAll: true
                          })}
                        >
                          Balance:&nbsp;&nbsp;
                          <Loading loading={item.loading}>{formatBalance(item.balance, item.decimals)}</Loading>
                        </div>
                      </GridItem>
                    </GridContainer>
                  </GridItem>
                )
              }
            })}
          </GridContainer>
          <GridContainer className="pr-4">
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <Button
                disabled={
                  !isLogin ||
                  (isLogin &&
                    (some(formConfig, item => isValidValue(item.name) === false) || every(formConfig, item => isValidValue(item.name) !== true)))
                }
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
            You can put any ratio and any amount of USDT,USDC,DAI into the Vault, the protocol will invest your funds in each protocol at the next
            rebalancing.
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
              {map(formConfig, item => {
                const { name, value, image, isValid, address } = item
                if (!isValid) {
                  return
                }
                return (
                  <div className={classes.token} key={address}>
                    <img className={classes.ModalTokenLogo} alt="" src={image} />
                    <span className={classes.name}>{name}: </span>
                    <span className={classes.name}>{Number(value).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={classes.itemBottom}>
            <div className={classes.exchangeInfo}>
              Receive:
              <span className={classes.usdiInfo}>{toFixed(estimateVaultBuffValue, BigNumber.from(10).pow(vaultBufferDecimals), 2)}</span>USDi Tickets
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
