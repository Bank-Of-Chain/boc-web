import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import BuildIcon from '@material-ui/icons/Build'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined'

// === Hooks === //
import useVaultFactory from '@/hooks/useVaultFactory'

// === Utils === //
import map from 'lodash/map'
import filter from 'lodash/filter'

// === Styles === //
import styles from './style'
import { isEmpty } from 'lodash'

const useStyles = makeStyles(styles)

const MyVault = props => {
  const { vaultChangeHandle, userProvider, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, tokens, modalCloseHandle } = props
  const { personalVault, addVault } = useVaultFactory(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, userProvider)
  const classes = useStyles()

  const vaults = filter(personalVault, i => tokens.includes(i.token))
  // only has 1 vault currently. set length = 2 makes page beatiful more.
  vaults.length = 2
  return (
    <GridContainer spacing={2}>
      <GridItem md={12}>
        <div className={classes.setting}>
          <HighlightOffOutlinedIcon style={{ color: '#A0A0A0' }} onClick={modalCloseHandle} />
        </div>
      </GridItem>

      {map(vaults, (item, index) => {
        return (
          <GridItem md={6} key={index}>
            {isEmpty(item) ? (
              <div className={classes.vault}>
                <div className={classes.vaultTitle}>
                  <img alt="" className={classes.icon} src={`https://bankofchain.io/logo256.png`} />
                </div>

                <Button color="colorfull" startIcon={<BuildIcon />} className={classes.button}>
                  on Building...
                </Button>
              </div>
            ) : (
              <div className={classes.vault}>
                <div className={classes.vaultTitle}>
                  <img alt="" className={classes.icon} src={`https://bankofchain.io/images/${item.token}.png`} />
                </div>
                {item.hasCreate ? (
                  <Button
                    color="colorfull"
                    startIcon={<CompareArrowsIcon />}
                    className={classes.button}
                    onClick={() => vaultChangeHandle(item.address, item.token)}
                  >
                    Deposit
                  </Button>
                ) : (
                  <Button
                    color="colorfull"
                    startIcon={<AddCircleOutlineIcon />}
                    className={classes.button}
                    onClick={() => addVault(item.token, item.type)}
                  >
                    Create
                  </Button>
                )}
              </div>
            )}
          </GridItem>
        )
      })}
    </GridContainer>
  )
}

export default MyVault
