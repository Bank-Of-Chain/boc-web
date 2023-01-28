import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import PoolsTable from './PoolsTable'
import { DepositIcon, SwitchIcon } from '@/components/SvgIcons'
import { useSelector, useDispatch } from 'react-redux'
import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'

// === Reducers === //
import { setCurrentTab } from '@/reducers/invest-reducer'

// === Constants === //
import { INVEST_TAB } from '@/constants/invest'

// === Utils === //
import useVersionWapper from '@/hooks/useVersionWapper'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const Lend = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const { userProvider, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, DIESEL_ADDRESS, DIESEL_TOKEN_ABI } = props

  const [operateIndex, setOperateIndex] = useState(-1)
  const [operateType, setOperateType] = useState(false)

  const current = useSelector(state => state.investReducer.currentTab)

  const setCurrent = useCallback(
    tab => {
      dispatch(setCurrentTab(tab))
    },
    [dispatch]
  )

  useEffect(() => {
    setCurrent(INVEST_TAB.lending)
  }, [setCurrent])

  return (
    <div className={classes.container}>
      <GridContainer spacing={0}>
        <GridItem xs={2} sm={2} md={3} style={{ paddingRight: '2rem' }}>
          <List disablePadding={true}>
            <ListItem key="Lending Pools" button className={classNames(classes.item)} onClick={() => setCurrent(INVEST_TAB.lending)}>
              <ListItemIcon>
                <DepositIcon color={current === INVEST_TAB.lending ? '#A68EFE' : '#fff'} />
              </ListItemIcon>
              {!isLayoutSm && (
                <ListItemText primary={'Lending Pools'} className={classNames(current === INVEST_TAB.lending ? classes.check : classes.text)} />
              )}
            </ListItem>
            <ListItem key="Back to ETHi" button className={classNames(classes.item)} onClick={() => history.push('/ethi')}>
              <ListItemIcon>
                <SwitchIcon style={{ color: '#fff' }} />
              </ListItemIcon>
              {!isLayoutSm && <ListItemText primary={'Back to ETHi'} className={classNames(classes.text)} />}
            </ListItem>
          </List>
        </GridItem>
        <GridItem xs={9} sm={9} md={9}>
          {current === INVEST_TAB.lending && (
            <PoolsTable
              actions={(index, type) => {
                setOperateIndex(index)
                setOperateType(type)
              }}
              DIESEL_TOKEN_ADDRESS={DIESEL_ADDRESS}
              DIESEL_TOKEN_ABI={DIESEL_TOKEN_ABI}
              POOL_SERVICE_ABI={POOL_SERVICE_ABI}
              POOL_SERVICE_ADDRESS={POOL_SERVICE_ADDRESS}
              userProvider={userProvider}
            />
          )}
        </GridItem>
      </GridContainer>
      <Modal
        className={classes.modal}
        open={operateIndex !== -1 && operateType === false}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper elevation={3} className={classes.depositModal}>
          <Withdraw
            DIESEL_TOKEN_ADDRESS={DIESEL_ADDRESS}
            POOL_SERVICE_ADDRESS={POOL_SERVICE_ADDRESS}
            POOL_SERVICE_ABI={POOL_SERVICE_ABI}
            userProvider={userProvider}
            onCancel={() => setOperateIndex(-1)}
          />
        </Paper>
      </Modal>
      <Modal
        className={classes.modal}
        open={operateIndex !== -1 && operateType === true}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper elevation={3} className={classes.depositModal}>
          <Deposit
            POOL_SERVICE_ADDRESS={POOL_SERVICE_ADDRESS}
            POOL_SERVICE_ABI={POOL_SERVICE_ABI}
            userProvider={userProvider}
            onCancel={() => setOperateIndex(-1)}
          />
        </Paper>
      </Modal>
    </div>
  )
}

export default useVersionWapper(Lend, 'lend')
