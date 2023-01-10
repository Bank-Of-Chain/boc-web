import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@/components/CustomButtons/Button'

// === Hooks === //
import usePool from '@/hooks/usePool'

// === Utils === //
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const PoolsTable = props => {
  const classes = useStyles()
  const { actions, POOL_ADDRESS, POOL_SERVICE_ABI, userProvider } = props

  const { balance, supply } = usePool(POOL_ADDRESS, POOL_SERVICE_ABI, userProvider)

  const datas = [
    {
      asset: WETH_ADDRESS,
      supply: `${toFixed(supply)} WETH`,
      supplyApy: '5.22%',
      BorrowApy: '3.23%',
      balance: toFixed(balance)
    }
  ]

  return (
    <div
      style={{
        padding: '1.875rem',
        borderRadius: '20px',
        background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)'
      }}
    >
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Supply</TableCell>
              <TableCell align="right">Supply Apy</TableCell>
              <TableCell align="right">Borrow Apy</TableCell>
              <TableCell align="right">Balances</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datas.map((row, index) => (
              <TableRow key={row.asset}>
                <TableCell component="th" scope="row">
                  <img className={classes.tokenLogo} alt="" src={`./images/${row.asset}.png`} />
                </TableCell>
                <TableCell align="right">{row.supply}</TableCell>
                <TableCell align="right">{row.supplyApy}</TableCell>
                <TableCell align="right">{row.BorrowApy}</TableCell>
                <TableCell align="right">{row.balance}</TableCell>
                <TableCell align="right">
                  <Button color="colorful-border" onClick={() => actions(index, true)}>
                    Supply
                  </Button>
                  &nbsp;&nbsp;
                  <Button color="colorful" onClick={() => actions(index, false)}>
                    withdraw
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default PoolsTable
