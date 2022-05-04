import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"
import clsx from "clsx"

// === Components === //
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import CardHeader from "@material-ui/core/CardHeader"
import Avatar from "@material-ui/core/Avatar"
import IconButton from "@material-ui/core/IconButton"
import CardMembershipIcon from "@material-ui/icons/CardMembership"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import Collapse from "@material-ui/core/Collapse"

// === Utils === //
import isEmpty from "lodash/isEmpty"
import resolver from "../../../services/abi-resolver"
import { ethers } from "ethers"

// === Styles === //
import styles from "./style"
import { toFixed } from "../../../helpers/number-format"
const useStyles = makeStyles(styles)

const { Contract } = ethers

export default function Template (props) {
  const history = useHistory()
  const classes = useStyles()
  const { name, description, path, dashboard_url, VAULT_ADDRESS, userProvider, isAudit } = props

  const [tvl, setTvl] = useState("0.00")
  const [apy, setApy] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const abis = resolver(props.abi_version)
  const { VAULT_ABI } = abis

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  useEffect(() => {
    if (isEmpty(VAULT_ABI) || isEmpty(VAULT_ADDRESS) || isEmpty(userProvider)) return
    const constact = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider)
    try {
      Promise.all([constact.tvl(), constact.decimals()]).then(([tvl, decimals]) => {
        setTvl(toFixed(tvl, decimals, 2))
      })
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
            Liquidity: ${tvl} Apy: {apy}%
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          {isAudit && (
            <IconButton color='inherit' title='Undering Protected' className={clsx(classes.expand)}>
              <CardMembershipIcon />
            </IconButton>
          )}
          <IconButton
            color='inherit'
            Collapse
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label='show more'
          >
            <ExpandMoreIcon />
          </IconButton>
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
        <Button size='small' color='inherit' onClick={() => history.push(dashboard_url)}>
          Dashboard
        </Button>
      </CardActions>
    </Card>
  )
}
