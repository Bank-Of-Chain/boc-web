import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Button from '@/components/CustomButtons/Button'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Icon from '@material-ui/core/Icon'
import Card from '@/components/CardDescription/Card'

// === Hooks === //
import useErc20Token from '@/hooks/useErc20Token'
import useDieselToken from '@/hooks/useDieselToken'
import usePoolService from '@/hooks/usePoolService'

// === Utils === //
import * as ethers from 'ethers'
import map from 'lodash/map'
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
      address: WETH_ADDRESS,
      asset: 'WETH',
      availableLiquidity: `${toFixed(availableLiquidity, BigNumber.from(10).pow(decimals), 4)} WETH`,
      totalBorrowed: `${toFixed(totalBorrowed, BigNumber.from(10).pow(decimals), 4)} WETH`,
      borrowPercent: `${toFixed(totalBorrowed.mul(BigNumber.from(10).pow(6)), availableLiquidity.mul(BigNumber.from(10).pow(4)), 6)} %`,
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
      {map(datas, (item, index) => {
        const { asset, address, availableLiquidity, totalBorrowed, supplyApy, BorrowApy, balance } = item
        return (
          <Card
            icon={<img className={classes.tokenLogo} alt="" src={`./images/${address}.png`} />}
            title={
              <>
                {asset}
                <Icon style={{ verticalAlign: 'sub' }} component={OpenInNewIcon} fontSize="small"></Icon>
              </>
            }
            contents={[
              {
                title: (
                  <>
                    Balances&nbsp;<Icon component={OpenInNewIcon} fontSize="small"></Icon>
                  </>
                ),
                content: balance
              },
              {
                title: 'Liquidity',
                content: availableLiquidity
              },
              {
                title: 'Total Borrowed',
                content: totalBorrowed
              },
              {
                title: 'Supply Apy',
                content: <span className={classes.apyText}>{supplyApy}</span>
              },
              {
                title: 'Borrow Apy',
                content: <span className={classes.apyText}>{BorrowApy}</span>
              },
              {
                title: 'Rewards',
                content: `${toFixed(rewardAmounts, BigNumber.from(10).pow(decimals), 6)} ETHi`
              }
            ]}
            footers={[
              {
                title: '',
                content: (
                  <Button color="colorful-border" onClick={() => actions(index, true)}>
                    Supply
                  </Button>
                )
              },
              {
                title: '',
                content: (
                  <Button color="colorful-border" onClick={() => actions(index, false)}>
                    Withdraw
                  </Button>
                )
              },
              {
                title: '',
                content: (
                  <Button color="colorful" onClick={getEarned}>
                    Claim Reward
                  </Button>
                )
              }
            ]}
          />
        )
      })}
    </div>
  )
}

export default PoolsTable
