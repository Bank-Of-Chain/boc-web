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
    background: '#323338',
    borderRadius: '20px',
    color: '#fff',
    marginRight: '1rem',
    height: '100%',
    padding: '0 0.5rem'
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
    lineHeight: '1.875rem'
  },
  pos: {
    marginBottom: 12
  },
  unit: {
    marginLeft: '0.5rem',
    fontSize: '1.3rem',
    backgroundImage: 'linear-gradient(223.3deg,#a68efd 20.71%,#f4acf3 103.56%)',
    '-webkitBackgroundClip': 'text',
    textFillColor: 'transparent'
  },
  content: {
    fontSize: '2.5rem',
    fontWeight: 700
  },
  footer: {
    paddingTop: '1rem'
  }
})

const CardComponent = props => {
  const { title, children, footer, content, loading, tip, unit, loadingOption = {} } = props
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{
          action: classes.action,
          title: classes.title
        }}
        action={tip}
        title={title}
      />
      <CardContent>
        {!isEmpty(content) && (
          <Loading loading={loading}>
            <Typography className={classes.content} variant="h5" component="h2">
              {content}
              <span className={classes.unit}>{unit}</span>
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

export default CardComponent
