import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import CustomTextField from '@/components/CustomTextField'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const MyVault = () => {
  const classes = useStyles()
  const [value, setValue] = useState(0)
  const [showDeposit, setShowDeposit] = useState(false)

  const handleChange = (e, newValue) => {
    setValue(newValue)
  }

  const toEarn = () => {
    setShowDeposit(true)
  }

  const backToVault = () => {
    setShowDeposit(false)
  }

  return (
    <GridContainer spacing={2}>
      {!showDeposit && (
        <>
          <GridItem xs={12} sm={12} md={12} lg={12}>
            <div className={classes.template}>
              <img className={classes.logo} alt="" src="/images/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png" />
              <img className={classes.logo} alt="" src="/images/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" />
              <span className={classes.name}>UniswapV3UsdcWeth500</span>
            </div>
          </GridItem>
          <GridItem xs={12} sm={12} md={6} lg={6}>
            <div className={classes.vault}>
              <div className={classes.vaultTitle}>WETH Vault</div>
              <Button color="colorfull" startIcon={<AddCircleOutlineIcon />} className={classes.button}>
                Create
              </Button>
              <Button color="colorfull" startIcon={<CompareArrowsIcon />} className={classes.button} onClick={toEarn}>
                Earn
              </Button>
            </div>
          </GridItem>
          <GridItem xs={12} sm={12} md={6} lg={6}>
            <div className={classes.vault}>
              <div className={classes.vaultTitle}>USDC Vault</div>
              <Button color="colorfull" startIcon={<AddCircleOutlineIcon />} className={classes.button}>
                Create
              </Button>
              <Button color="colorfull" startIcon={<CompareArrowsIcon />} className={classes.button} onClick={toEarn}>
                Earn
              </Button>
            </div>
          </GridItem>
        </>
      )}
      {showDeposit && (
        <GridItem xs={12} sm={12} md={12} lg={9}>
          <div className={classes.vault}>
            <Tabs value={value} onChange={handleChange} indicatorColor="primary" centered>
              <Tab label="Deposit" />
              <Tab label="Withdraw" />
            </Tabs>
            {value === 0 && (
              <>
                <div className={classes.token}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.logo} alt="" src="/images/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png" />
                    <span className={classes.name}>WETH</span>
                  </div>
                  <CustomTextField classes={{ root: classes.input }} placeholder="Deposit amount" maxEndAdornment />
                </div>
                <div>Balance: 0</div>
                <Button color="colorfull" className={classes.button}>
                  Deposit
                </Button>
                <Button color="danger" className={classes.button} onClick={backToVault}>
                  Cancel
                </Button>
              </>
            )}
            {value === 1 && (
              <>
                <div className={classes.token}>
                  <div className={classes.tokenInfo}>
                    <img className={classes.logo} alt="" src="/images/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png" />
                    <span className={classes.name}>WETH</span>
                  </div>
                  <CustomTextField classes={{ root: classes.input }} placeholder="Withdraw amount" maxEndAdornment />
                </div>
                <div>Balance: 0</div>
                <Button color="colorfull" className={classes.button}>
                  Withdraw
                </Button>
                <Button color="danger" className={classes.button} onClick={backToVault}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </GridItem>
      )}
    </GridContainer>
  )
}

export default MyVault
