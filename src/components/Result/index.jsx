import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Loading from '@/components/LoadingComponent'
import HeartBeet from '@/components/HeartBeet'
import Circle from '@/components/CountDown/Circle'
import Button from '@/components/CustomButtons/Button'

// === Hooks === //
import useMetaMask from '@/hooks/useMetaMask'
import useTimeWait from '@/hooks/useTimeWait'

// === Utils === //
import { BigNumber } from 'ethers'
import { toFixed } from '@/helpers/number-format'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)
const Result = props => {
  const { userProvider, onClose } = props
  const { gasPrice, gasPriceLoading } = useMetaMask(userProvider)
  const { fromNow } = useTimeWait()
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <p className={classes.headerText}>On Deposit&nbsp;...&nbsp;</p>
      <div className={classes.swapBody}>
        <ol className={classes.olItem}>
          <li className={classes.liItem}>
            <div className={classes.liTitle}>Waiting</div>
            <div className={classes.value}>
              <HeartBeet size="0.7rem"></HeartBeet>
              {fromNow}
            </div>
          </li>
          <li className={classes.liItem}>
            <div className={classes.liTitle}>Current Price</div>
            <div className={classes.value}>
              <Loading loading={gasPriceLoading}>{toFixed(`${gasPrice}`, BigNumber.from(10).pow(9), 2)}</Loading>&nbsp;Gwei&nbsp;
              <Circle size={15} times={50} duration={5000} />
            </div>
          </li>
          <li className={classes.liItem}>
            <div className={classes.liTitle}>Gas Price</div>
            <div className={classes.value}>{`${toFixed(`${gasPrice}`, BigNumber.from(10).pow(9), 2)} Gwei`}</div>
          </li>
        </ol>
      </div>
      <div className={classes.footer}>
        <Button className={classes.cancelButton} color="danger" onClick={onClose}>
          Close this modal
        </Button>
      </div>
    </div>
  )
}

export default Result
