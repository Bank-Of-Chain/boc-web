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
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'

// === Hooks === //
import useErc20Token from '@/hooks/useErc20Token'
import useDieselToken from '@/hooks/useDieselToken'
import usePoolService from '@/hooks/usePoolService'

// === Utils === //
import * as ethers from 'ethers'
import { toFixed } from '@/helpers/number-format'

// === Constants === //
import { WETH_ADDRESS } from '@/constants/tokens'

// === Styles === //
import styles from './style'

const { BigNumber } = ethers

const useStyles = makeStyles(styles)

const PoolsTable = props => {
  const classes = useStyles()
  const { actions, POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider } = props

  const { availableLiquidity, totalBorrowed, borrowApy, supplyApy } = usePoolService(POOL_SERVICE_ADDRESS, POOL_SERVICE_ABI, userProvider)

  const { decimals } = useErc20Token(WETH_ADDRESS, userProvider)

  const { rewardAmounts, getEarned, balance, decimals: dieselDecimals } = useDieselToken(DIESEL_TOKEN_ADDRESS, DIESEL_TOKEN_ABI, userProvider)

  const datas = [
    {
      asset: WETH_ADDRESS,
      availableLiquidity: `${toFixed(availableLiquidity, BigNumber.from(10).pow(decimals), 4)} WETH`,
      totalBorrowed: `${toFixed(totalBorrowed, BigNumber.from(10).pow(decimals), 4)} WETH`,
      supplyApy: `${supplyApy}%`,
      BorrowApy: `${borrowApy}%`,
      balance: `${toFixed(balance, BigNumber.from(10).pow(dieselDecimals), 2)} Diesels`
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
              <TableCell>Pool Asset</TableCell>
              <TableCell align="right">Available Liquidity</TableCell>
              <TableCell align="right">Total Borrowed</TableCell>
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
                <TableCell align="right">{row.availableLiquidity}</TableCell>
                <TableCell align="right">{row.totalBorrowed}</TableCell>
                <TableCell align="right">{row.supplyApy}</TableCell>
                <TableCell align="right">{row.BorrowApy}</TableCell>
                <TableCell align="right">{row.balance}</TableCell>
                <TableCell align="center">
                  <Button color="colorful-border" style={{ marginBottom: '0.25rem' }} onClick={() => actions(index, true)}>
                    Supply
                  </Button>
                  <Button color="colorful" style={{ marginBottom: '0.25rem' }} onClick={() => actions(index, false)}>
                    withdraw
                  </Button>
                  <Button color="colorful-border" onClick={getEarned}>
                    Claim
                    <Tooltip
                      classes={{
                        tooltip: classes.tooltip
                      }}
                      placement="top"
                      title={`current reward amounts: ${toFixed(rewardAmounts, BigNumber.from(10).pow(decimals))} ETHi`}
                    >
                      <InfoIcon style={{ marginLeft: '0.2rem', fontSize: '1rem' }} />
                    </Tooltip>
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
