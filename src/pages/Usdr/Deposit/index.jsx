import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Loading from '@/components/LoadingComponent'

import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import CustomTextField from '@/components/CustomTextField'
import Button from '@/components/CustomButtons/Button'
import SwapVerticalCircleOutlinedIcon from '@material-ui/icons/SwapVerticalCircleOutlined'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import debounce from 'lodash/debounce'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { warmDialog } from '@/reducers/meta-reducer'
import { toFixed, formatBalance } from '@/helpers/number-format'

// === Constants === //
import { isAd, isEs, isRp, isDistributing, errorTextOutput, isLessThanMinValue } from '@/helpers/error-handler'
import { BN_18 } from '@/constants/big-number'
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT } from '@/constants'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  address,
  userProvider,
  VAULT_ABI,
  VAULT_ADDRESS,
  ETH_ADDRESS,
  isBalanceLoading,
  minimumInvestmentAmount,
  wantTokenBalance,
  wantTokenDecimals,
  wantTokenSymbol,
  wantTokenForVault,
  modalOpenHandle
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [ethValue, setEthValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimer = useRef()

  /**
   * check if value is valid
   * @returns
   */
  function isValidValue() {
    const balance = wantTokenBalance
    const decimals = wantTokenDecimals
    const value = ethValue
    if (value === '' || value === '-' || value === '0' || isEmpty(value.replace(/ /g, ''))) return
    // not a number
    if (isNaN(Number(value))) return false
    const nextValue = BN(value)
    const nextFromValue = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    // less than 0
    if (nextFromValue.lte(0)) return false
    // value should be integer
    const nextFromValueString = nextValue.multipliedBy(BigNumber.from(10).pow(decimals).toString())
    if (nextFromValueString.toFixed().indexOf('.') !== -1) return false
    // balance less than value
    if (balance.lt(BigNumber.from(nextFromValue.toFixed()))) return false

    return true
  }

  const handleInputChange = event => {
    setEthValue(event.target.value)
  }

  const handleMaxClick = () => {
    const maxValue = wantTokenBalance
    setEthValue(
      formatBalance(maxValue.gt(0) ? maxValue : 0, wantTokenDecimals, {
        showAll: true
      })
    )
  }

  const diposit = async () => {
    clearTimeout(loadingTimer.current)
    const isValid = isValidValue()
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
    const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(wantTokenDecimals).toString()).toFixed())
    console.log('nextTokens=', ETH_ADDRESS, amount)
    const signer = userProvider.getSigner()
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    const nVaultWithUser = vaultContract.connect(signer)
    let isSuccess = false

    const extendObj = {}
    // if gasLimit times not 1, need estimateGas
    if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
      const gas = await nVaultWithUser.estimateGas.mint(ETH_ADDRESS, amount, 0, { from: address, value: amount })
      const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
      // gasLimit not exceed maximum
      const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
      extendObj.gasLimit = maxGasLimit
    }
    await nVaultWithUser
      .mint(ETH_ADDRESS, amount, 0, {
        ...extendObj,
        from: address,
        value: amount
      })
      .then(tx => tx.wait())
      .then(() => {
        isSuccess = true
      })
      .catch(error => {
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
      })

    if (isSuccess) {
      setEthValue('')
    }

    loadingTimer.current = setTimeout(() => {
      setIsLoading(false)
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
  }

  const estimateMint = useCallback(
    debounce(async () => {
      const isValid = isValidValue()
      if (!isValid) {
        return
      }
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const amount = BigNumber.from(BN(ethValue).multipliedBy(BigNumber.from(10).pow(wantTokenDecimals).toString()).toFixed())
      await vaultContract.estimateMint(ETH_ADDRESS, amount).catch(error => {
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
    }, 1500)
  )

  useEffect(() => {
    estimateMint()
    return () => estimateMint.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethValue])

  useEffect(() => {
    const estimatedUsedValue = BigNumber.from(10).pow(wantTokenDecimals)
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS) || isEmpty(VAULT_ABI) || wantTokenBalance.lt(estimatedUsedValue)) {
      return
    }
    // const signer = userProvider.getSigner()
    // const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    // const nVaultWithUser = vaultContract.connect(signer)
    // nVaultWithUser.estimateGas
    //   .mint(ETH_ADDRESS, estimatedUsedValue, {
    //     from: address,
    //     value: estimatedUsedValue
    //   })
    //   .then(setMintGasLimit)
    //   .catch(noop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProvider, VAULT_ADDRESS, wantTokenBalance, VAULT_ABI])

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
        <div className={classes.setting}>
          <SwapVerticalCircleOutlinedIcon onClick={modalOpenHandle} />
        </div>
        <p className={classes.estimateText}>From</p>
        <GridItem xs={12} sm={12} md={12} lg={12} className={classes.tokenInputWrapper}>
          <GridContainer>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <div className={classes.inputLabelWrapper}>
                <div className={classes.tokenInfo}>
                  <img className={classes.tokenLogo} alt="" src={`./images/${wantTokenForVault}.png`} />
                  <span className={classes.tokenName}>{wantTokenSymbol}</span>
                </div>
                <CustomTextField
                  classes={{ root: classes.input }}
                  value={ethValue}
                  onChange={handleInputChange}
                  placeholder="deposit amount"
                  maxEndAdornment
                  onMaxClick={handleMaxClick}
                  error={!isUndefined(isValid) && !isValid}
                />
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} lg={12}>
              <p
                className={classes.estimateText}
                title={formatBalance(wantTokenBalance, wantTokenDecimals, {
                  showAll: true
                })}
              >
                Balance:&nbsp;&nbsp;
                <Loading loading={isBalanceLoading}>{formatBalance(wantTokenBalance, wantTokenDecimals)}</Loading>
              </p>
            </GridItem>
          </GridContainer>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button disabled={!isLogin || (isLogin && !isValid)} color="colorfull" onClick={diposit} style={{ width: '100%' }}>
              Deposit
            </Button>
          </div>
        </GridItem>
      </GridContainer>
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
