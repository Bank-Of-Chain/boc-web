import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Button from '@/components/CustomButtons/Button'
import BuildIcon from '@material-ui/icons/Build'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import LoadingComponent from '@/components/LoadingComponent'
import CachedIcon from '@material-ui/icons/Cached'
import DeleteIcon from '@material-ui/icons/Delete'

// === Hooks === //
import useVaultFactory from '@/hooks/useVaultFactory'

// === Utils === //
import map from 'lodash/map'
import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import isEmpty from 'lodash/isEmpty'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const MyVault = props => {
  const { vaultChangeHandle, userProvider, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, tokens } = props
  const { personalVault, addVault, loading, adding, deleteVault } = useVaultFactory(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, userProvider)
  const classes = useStyles()
  const vaults = filter(personalVault, i => tokens.includes(i.token))

  const deleteSelectVault = address => {
    const index = findIndex(personalVault, item => item.address === address)
    deleteVault(personalVault[0].type, index)
  }

  useEffect(() => {
    const matchItem = find(vaults, { hasCreate: true })
    if (!isEmpty(matchItem)) {
      vaultChangeHandle(matchItem.address, matchItem.token)
    }
  }, [vaults, vaultChangeHandle])

  return (
    <div>
      <h3 className={classes.title}>Create a vault</h3>
      <div className={classes.vaults}>
        <LoadingComponent loading={loading} width="100%" height="2rem">
          {map(vaults, (item, index) => {
            return (
              <div key={index}>
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
                      <>
                        <Button
                          color="colorfull"
                          startIcon={<CompareArrowsIcon />}
                          className={classes.button}
                          onClick={() => vaultChangeHandle(item.address, item.token)}
                        >
                          Deposit
                        </Button>
                        <Button color="danger" startIcon={<DeleteIcon />} className={classes.button} onClick={() => deleteSelectVault(item.address)}>
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        color="colorfull"
                        startIcon={adding ? <CachedIcon className={classes.loading} /> : <AddCircleOutlineIcon />}
                        className={classes.button}
                        onClick={() => addVault(item.token, item.type)}
                      >
                        Create
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </LoadingComponent>
      </div>
    </div>
  )
}

export default MyVault
