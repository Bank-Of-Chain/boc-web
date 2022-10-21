import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import BuildIcon from '@material-ui/icons/Build'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined'
import LoadingComponent from '@/components/LoadingComponent'

// === Hooks === //
import useVaultFactory from '@/hooks/useVaultFactory'
import { useHistory } from 'react-router-dom'

// === Utils === //
import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'

// === Styles === //
import styles from './style'
import { isEmpty } from 'lodash'

const useStyles = makeStyles(styles)

const MyVault = props => {
  const { vaultChangeHandle, userProvider, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, tokens } = props
  const { personalVault, addVault, loading } = useVaultFactory(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, userProvider)
  const classes = useStyles()
  const { push } = useHistory()

  const vaults = filter(personalVault, i => tokens.includes(i.token))
  // only has 1 vault currently. set length = 2 makes page beatiful more.
  vaults.length = 2

  useEffect(() => {
    const matchItem = find(vaults, { hasCreate: true })
    if (!isEmpty(matchItem)) {
      vaultChangeHandle(matchItem.address, matchItem.token)
    }
  }, [vaults, vaultChangeHandle])

  return (
    <GridContainer spacing={2}>
      <GridItem md={12}>
        <div className={classes.setting}>
          <ExitToAppOutlinedIcon style={{ color: '#A0A0A0' }} onClick={() => push('/usdi')} />
        </div>
      </GridItem>
      <LoadingComponent loading={loading}>
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
      </LoadingComponent>
    </GridContainer>
  )
}

export default MyVault
