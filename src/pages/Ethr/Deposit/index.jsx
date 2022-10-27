import React, { useState } from 'react'
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
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'

// === Utils === //
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import * as ethers from 'ethers'
import BN from 'bignumber.js'
import { warmDialog } from '@/reducers/meta-reducer'
import { formatBalance } from '@/helpers/number-format'

// === Constants === //
import { MULTIPLE_OF_GAS, MAX_GAS_LIMIT, IERC20_ABI } from '@/constants'

// === Styles === //
import styles from './style'

const { Contract, BigNumber } = ethers
const useStyles = makeStyles(styles)

export default function Deposit({
  address,
  estimatedTotalAssets,
  userProvider,
  VAULT_ABI,
  VAULT_ADDRESS,
  isBalanceLoading,
  minInvestment,
  wantTokenBalance,
  wantTokenDecimals,
  wantTokenSymbol,
  wantTokenForVault,
  manageFeeBps,
  onDepositSuccess
}) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * check if value is valid
   * @returns
   */
  function isValidValue() {
    const balance = wantTokenBalance
    const decimals = wantTokenDecimals
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
    setValue(event.target.value)
  }

  const handleMaxClick = () => {
    const maxValue = wantTokenBalance
    setValue(
      formatBalance(maxValue.gt(0) ? maxValue : 0, wantTokenDecimals, {
        showAll: true
      })
    )
  }

  const deposit = async () => {
    const amount = BigNumber.from(BN(value).times(BN(10).pow(wantTokenDecimals)).toFixed())
    const totalInvest = amount.add(estimatedTotalAssets)
    const lessThanMin = totalInvest.lt(minInvestment)
    if (lessThanMin) {
      dispatch(
        warmDialog({
          open: true,
          type: 'warning',
          message: 'Less than minimum investment'
        })
      )
      return
    }
    setIsLoading(true)
    try {
      const amount = BigNumber.from(value).mul(BigNumber.from(10).pow(wantTokenDecimals))
      const signer = userProvider.getSigner()
      const tokenContract = new Contract(wantTokenForVault, IERC20_ABI, userProvider)
      const tokenContractWithUser = tokenContract.connect(signer)
      const allowanceAmount = await tokenContractWithUser.allowance(address, VAULT_ADDRESS)
      // If deposit amount greater than allow amount, need approve
      if (amount.gt(allowanceAmount)) {
        // If allowance gt 0, increaseAllowance, otherwise approve nextAmount
        if (allowanceAmount.gt(0)) {
          await tokenContractWithUser
            .increaseAllowance(VAULT_ADDRESS, amount.sub(allowanceAmount))
            .then(tx => tx.wait())
            .catch(async e => {
              console.table(e)
              // cancel by user
              if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
                return Promise.reject(e)
              }
              // If increase failed, approve 0 and approve nextAmounts
              await tokenContractWithUser.approve(VAULT_ADDRESS, 0)
              await tokenContractWithUser.approve(VAULT_ADDRESS, amount).then(tx => tx.wait())
            })
        } else {
          await tokenContractWithUser.approve(VAULT_ADDRESS, amount)
        }
      }

      const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
      const vaultContractWithUser = vaultContract.connect(signer)

      const extendObj = {}
      // if gasLimit times not 1, need estimateGas
      if (isNumber(MULTIPLE_OF_GAS) && MULTIPLE_OF_GAS !== 1) {
        const gas = await vaultContractWithUser.estimateGas.lend(amount)
        const gasLimit = Math.ceil(gas * MULTIPLE_OF_GAS)
        // gasLimit not exceed maximum
        const maxGasLimit = gasLimit < MAX_GAS_LIMIT ? gasLimit : MAX_GAS_LIMIT
        extendObj.gasLimit = maxGasLimit
      }
      await vaultContractWithUser.lend(amount, extendObj).then(tx => tx.wait())
      setValue('')
      setIsLoading(false)
      dispatch(
        warmDialog({
          open: true,
          type: 'success',
          message: 'Success'
        })
      )
      onDepositSuccess()
    } catch (error) {
      console.log('error', error)
      setIsLoading(false)
      dispatch(
        warmDialog({
          open: true,
          type: 'error',
          message: 'Deposit failed'
        })
      )
    }
  }

  const isLogin = !isEmpty(userProvider)
  const isValid = isValidValue()
  const bps = manageFeeBps ? manageFeeBps.toString() / 10000 : 0

  return (
    <>
      <GridContainer classes={{ root: classes.depositContainer }}>
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
                  value={value}
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
      <GridContainer className={classes.estimateContainer}>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p className={classes.estimateText}>To</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.estimateWrapper}>
            <span>{wantTokenSymbol} VAULT</span>
            <span className={classes.estimateBalanceNum}>{Number(value) * (1 - bps)}</span>
          </div>
        </GridItem>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <p
            className={classes.balance}
            title={formatBalance(estimatedTotalAssets, wantTokenDecimals, {
              showAll: true
            })}
          >
            Balance:&nbsp;&nbsp;
            <Loading loading={isBalanceLoading}>{formatBalance(estimatedTotalAssets, wantTokenDecimals)}</Loading>
          </p>
          <div className={classes.min}>Minimum Investment: {formatBalance(minInvestment, wantTokenDecimals)}</div>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <div className={classes.footerContainer}>
            <Button disabled={!isLogin || (isLogin && !isValid)} color="colorfull" onClick={deposit} style={{ width: '100%' }}>
              Deposit
              <Tooltip
                classes={{
                  tooltip: classes.tooltip
                }}
                placement="top"
                title={`${bps * 100}% manage fee of the principal.`}
              >
                <InfoIcon style={{ marginLeft: '0.5rem' }} />
              </Tooltip>
            </Button>
          </div>
        </GridItem>
      </GridContainer>
      <Modal className={classes.modal} open={isLoading} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
        <Paper elevation={3} className={classes.depositModal}>
          <div className={classes.modalBody}>
            <CircularProgress color="inherit" />
            <div style={{ marginTop: '1rem' }}>On Deposit...</div>
          </div>
        </Paper>
      </Modal>
    </>
  )
}
