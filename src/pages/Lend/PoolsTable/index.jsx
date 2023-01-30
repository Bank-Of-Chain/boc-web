import React from 'react'
import classNames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Button from '@/components/CustomButtons/Button'

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
          <a className={classes.item} key={index}>
            <div className={classes.inner}>
              <div className={classes.header}>
                <div className={classes.icon}>
                  <img className={classes.tokenLogo} alt="" src={`./images/${address}.png`} />
                </div>
                <div className={classes.text}>{asset}</div>
              </div>
              <div className={classes.body}>
                <div className={classes.bodyInner}>
                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Balances</div>
                    <div className={classes.content}>{balance}</div>
                  </div>
                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Liquidity</div>
                    <div className={classes.content}>{availableLiquidity}</div>
                  </div>
                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Total Borrowed</div>
                    <div className={classes.content}>{totalBorrowed}</div>
                  </div>
                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Supply Apy</div>
                    <div className={classNames(classes.content, classes.apyText)}>{supplyApy}</div>
                  </div>
                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Borrow Apy</div>
                    <div className={classNames(classes.content, classes.apyText)}>{BorrowApy}</div>
                  </div>

                  <div className={classes.bodyItem}>
                    <div className={classes.bodyItemTitle}>Rewards</div>
                    <div className={classes.content}>{`${toFixed(rewardAmounts, BigNumber.from(10).pow(decimals))} ETHi`}</div>
                  </div>
                </div>
              </div>
              <div className={classes.footer}>
                <div className={classes.footerInner}>
                  <div className={classes.bodyItem}>
                    <Button color="colorful-border" onClick={() => actions(index, true)}>
                      Supply
                    </Button>
                  </div>
                  <div className={classes.bodyItem}>
                    <Button color="colorful-border" onClick={() => actions(index, false)}>
                      Withdraw
                    </Button>
                  </div>
                  <div className={classes.bodyItem}>
                    <Button color="colorful" onClick={getEarned}>
                      Claim Reward
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

export default PoolsTable
