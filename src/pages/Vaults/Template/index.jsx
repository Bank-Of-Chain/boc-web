import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"

// === Components === //
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import Divider from '@material-ui/core/Divider';

// === Styles === //
import styles from "./style"
const useStyles = makeStyles(styles)

export default function Template (props) {
  const history = useHistory()
  const classes = useStyles()
  const {
    name,
    description,
    path,
    abi_version,
    vault_address,
    img_path = "https://bankofchain.io/logo256.png",
  } = props

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          component='img'
          alt='Contemplative Reptile'
          height='140'
          image={img_path}
          title='Contemplative Reptile'
        />
        <Divider />
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            {name}
          </Typography>
          <Typography variant='body2' color='textSecondary' component='p'>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size='small' color='primary' onClick={() => history.push(path.slice(1))}>
          Invest
        </Button>
      </CardActions>
    </Card>
  )
}
