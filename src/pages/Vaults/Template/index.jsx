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
import Divider from "@material-ui/core/Divider"

// === Styles === //
import styles from "./style"
const useStyles = makeStyles(styles)

export default function Template (props) {
  const history = useHistory()
  const classes = useStyles()
  const { name, description, path, img_path } = props

  return (
    <Card className={classes.card}>
      <CardActionArea className={classes.actionArea}>
        <CardMedia component='img' className={classes.img} alt={description} image={img_path} title={name} />
        <Divider />
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            {name}
          </Typography>
          <Typography variant='body2' component='p'>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size='small' color='inherit' onClick={() => history.push(path.slice(1))}>
          Invest
        </Button>
        <Button size='small' color='inherit'>
          Dashboard
        </Button>
      </CardActions>
    </Card>
  )
}
