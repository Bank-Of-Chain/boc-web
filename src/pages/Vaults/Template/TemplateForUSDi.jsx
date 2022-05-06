import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"
import classnames from "classnames"

// === Components === //
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import CardHeader from "@material-ui/core/CardHeader"
import Avatar from "@material-ui/core/Avatar"
import CardMembershipIcon from "@material-ui/icons/CardMembership"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Collapse from "@material-ui/core/Collapse"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"

// === Utils === //
import isEmpty from "lodash/isEmpty"
import resolver from "../../../services/abi-resolver"
import { ethers } from "ethers"

// === Styles === //
import styles from "./style"
import { toFixed } from "../../../helpers/number-format"
const useStyles = makeStyles(styles)

const { Contract, BigNumber } = ethers

export default function TemplateForUSDi (props) {
  const history = useHistory()
  const classes = useStyles()
  const { name, description, path, dashboard_url, VAULT_ADDRESS, userProvider, isAudit } = props

  const [tvl, setTvl] = useState("0.00")
  const [apy, setApy] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const [trackedAssets, setTrackedAssets] = useState([])
  const [totalValue, setTotalValue] = useState(BigNumber.from(0))
  const [totalValueInVault, setTotalValueInVault] = useState(BigNumber.from(0))
  const [totalValueInStrategies, setTotalValueInStrategies] = useState(BigNumber.from(0))

  console.log(
    "totalValue=",
    totalValue.toString(),
    totalValueInVault.toString(),
    totalValueInStrategies.toString(),
    trackedAssets,
  )
  const abis = resolver(props.abi_version)
  const { VAULT_ABI } = abis

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  useEffect(() => {
    if (isEmpty(VAULT_ABI) || isEmpty(VAULT_ADDRESS) || isEmpty(userProvider)) return
    console.log("VAULT_ABI=", VAULT_ADDRESS, VAULT_ABI)
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    try {
      // constact.totalValue().then(console.log)
      // Promise.all([constact.totalAssets()]).then(([tvl, decimals]) => {
      //   console.log('tvl, decimals=', tvl, decimals)
      //   setTvl(toFixed(tvl, decimals, 2))
      // })
      vaultContract.getTrackedAssets().then(setTrackedAssets)
      vaultContract.totalValue().then(setTotalValue)
      vaultContract.totalValueInVault().then(setTotalValueInVault)
      vaultContract.totalValueInStrategies().then(setTotalValueInStrategies)
    } catch (error) {
      console.log("error=", error)
    }
  }, [VAULT_ABI, VAULT_ADDRESS, userProvider])

  return (
    <Card className={classes.card}>
      <CardActionArea className={classes.actionArea}>
        <CardHeader
          className={classes.header}
          avatar={
            <Avatar aria-label='recipe' className={classes.avatar}>
              Vs
            </Avatar>
          }
        />
        <CardContent>
          <Typography align='left' gutterBottom variant='h5' component='h2'>
            {name}
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            {description}
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            Deposited: ETH/3CRV
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            Liquidity: ${toFixed(totalValue, 1, 2)}
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            Rewards(last 7 days): $123.23
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            APY(last 7 days): 12.3%
          </Typography>
          <Typography align='left' variant='body2' component='p'>
            Apy(last 365 days): {apy}%
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          {isAudit && (
            <CardMembershipIcon
              color='inherit'
              aria-label='Undering Protected'
              className={classnames(classes.expand)}
            />
          )}
          {expanded ? (
            <ExpandLessIcon
              color='inherit'
              className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label='show more'
            />
          ) : (
            <ExpandMoreIcon
              color='inherit'
              className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label='show more'
            />
          )}
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <Typography variant='body2' component='p'>
            More Details
          </Typography>
        </Collapse>
      </CardActionArea>
      <CardActions>
        <Button size='small' color='inherit' onClick={() => history.push(path.slice(1))}>
          Invest
        </Button>
        <Button size='small' color='inherit' target='_blank' href={dashboard_url}>
          Dashboard
        </Button>
      </CardActions>
    </Card>
  )
}
