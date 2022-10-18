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
import classNames from 'classnames'

const useStyles = makeStyles(styles)

const MyVault = props => {
  const { setPersonalVaultAddress } = props
  const classes = useStyles()
  const [templateIndex, setTemplateIndex] = useState(-1)
  const [value, setValue] = useState(0)
  const [showDeposit, setShowDeposit] = useState(false)

  const handleChange = (e, newValue) => {
    setValue(newValue)
  }

  const toEarn = () => {
    // setShowDeposit(true)
    setPersonalVaultAddress('0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619')
  }

  const backToVault = () => {
    setShowDeposit(false)
  }

  const size = 12
  return (
    <GridContainer spacing={2}>
      {!showDeposit && (
        <>
          <GridItem xs={size} sm={size} md={size} lg={size}>
            <div
              className={classNames({ [classes.template]: true, [classes.checked]: templateIndex === 0 })}
              onClick={() => setTemplateIndex(templateIndex === 0 ? -1 : 0)}
            >
              <img className={classes.logo} alt="" src="/images/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619.png" />
              <img className={classes.logo} alt="" src="/images/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png" />
              <span className={classes.name}>UniswapV3UsdcWeth500</span>
            </div>
          </GridItem>
          <GridItem xs={size} sm={size} md={size} lg={size}>
            <div
              className={classNames({ [classes.template]: true, [classes.checked]: templateIndex === 1 })}
              onClick={() => setTemplateIndex(templateIndex === 1 ? -1 : 1)}
            >
              <img className={classes.logo} alt="" src="/images/0xdAC17F958D2ee523a2206206994597C13D831ec7.png" />
              <img className={classes.logo} alt="" src="/images/0x20BC832ca081b91433ff6c17f85701B6e92486c5.png" />
              <span className={classes.name}>UniswapV3UsdtrEth2000</span>
            </div>
          </GridItem>
          <GridItem xs={size} sm={size} md={size} lg={size}>
            <div
              className={classNames({ [classes.template]: true, [classes.checked]: templateIndex === 2 })}
              onClick={() => setTemplateIndex(templateIndex === 2 ? -1 : 2)}
            >
              <img className={classes.logo} alt="" src="/images/0x6B175474E89094C44Da98b954EedeAC495271d0F.png" />
              <img className={classes.logo} alt="" src="/images/0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb.png" />
              <span className={classes.name}>UniswapV3DaiEth3000</span>
            </div>
          </GridItem>
          {templateIndex !== -1 && (
            <GridItem xs={size} sm={size} md={6} lg={size}>
              <div className={classes.vault}>
                <div className={classes.vaultTitle}>WETH Vault</div>
                {/* <Button color="colorfull" startIcon={<AddCircleOutlineIcon />} className={classes.button}>
                Create
              </Button> */}
                <Button color="colorfull" startIcon={<CompareArrowsIcon />} className={classes.button} onClick={toEarn}>
                  Deposit
                </Button>
              </div>
            </GridItem>
          )}
          {templateIndex !== -1 && (
            <GridItem xs={size} sm={size} md={6} lg={size}>
              <div className={classes.vault}>
                <div className={classes.vaultTitle}>USDC Vault</div>
                <Button color="colorfull" startIcon={<AddCircleOutlineIcon />} className={classes.button}>
                  Create
                </Button>
                {/* <Button color="colorfull" startIcon={<CompareArrowsIcon />} className={classes.button} onClick={toEarn}>
                Earn
              </Button> */}
              </div>
            </GridItem>
          )}
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
