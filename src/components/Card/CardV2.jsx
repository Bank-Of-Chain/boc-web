import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Loading from '@/components/LoadingComponent'

// === Utils === //
import isEmpty from 'lodash/isEmpty'

const useStyles = makeStyles({
  root: {
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    borderRadius: '20px',
    color: '#fff',
    padding: '1.875rem'
  },
  action: {
    flex: 'none',
    alignSelf: 'auto',
    margin: 0
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    color: '#fff',
    fontSize: '1.25rem',
    lineHeight: '1.875rem',
    fontFamily: 'DM Sans'
  },
  pos: {
    marginBottom: 12
  },
  unit: {
    marginLeft: '0.625rem',
    backgroundImage: 'linear-gradient(223.3deg,#a68efd 20.71%,#f4acf3 103.56%)',
    '-webkitBackgroundClip': 'text',
    textFillColor: 'transparent'
  },
  content: {
    lineHeight: '3rem',
    fontSize: '1rem'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    height: '1rem',
    lineHeight: 1,
    fontSize: '0.75rem',
    fontFamily: 'DM Sans'
  },
  header: {
    padding: '5px'
  },
  cardContent: {
    padding: '5px',
    '&:last-child': {
      padding: '5px'
    }
  }
})

const CardV2 = props => {
  const { title, children, footer, content, loading, tip, fullAmount, loadingOption = {} } = props
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{
          action: classes.action,
          title: classes.title,
          root: classes.header
        }}
        action={tip}
        title={title}
      />
      <CardContent
        classes={{
          root: classes.cardContent
        }}
      >
        {!isEmpty(content) && (
          <Loading loading={loading}>
            <Typography className={classes.content} style={{ fontFamily: 'DM Sans' }} variant="h5" component="h2" title={fullAmount}>
              {content}
            </Typography>
          </Loading>
        )}
        <Loading {...loadingOption} loading={loading}>
          {children}
        </Loading>

        {!isEmpty(footer) && (
          <Loading loading={loading}>
            <Typography className={classes.footer} variant="body2" component="p">
              {footer}
            </Typography>
          </Loading>
        )}
      </CardContent>
    </Card>
  )
}

export default CardV2
