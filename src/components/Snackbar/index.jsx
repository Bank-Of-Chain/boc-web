import React, { useCallback, useEffect } from 'react'

// === Components === //
import Snackbar from '@material-ui/core/Snackbar'
import Slide from '@material-ui/core/Slide'
import Button from '@material-ui/core/Button'

const SnackbarComponent = props => {
  const { index, children, close } = props
  const [open, setOpen] = React.useState(false)
  const [transition, setTransition] = React.useState(undefined)

  const TransitionRight = useCallback(props => {
    return <Slide {...props} direction="right" />
  }, [])

  const handleClick = useCallback(
    Transition => () => {
      setTransition(() => Transition)
      setOpen(true)
    },
    []
  )

  const action = (
    <Button color="secondary" size="small" onClick={close}>
      Hidden
    </Button>
  )

  useEffect(() => {
    handleClick(TransitionRight)()
  }, [handleClick, TransitionRight])

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      style={{ top: `${120 + 60 * index}px` }}
      TransitionComponent={transition}
      open={open}
      message={children}
      key={transition ? transition.name : ''}
      action={action}
    />
  )
}

export default SnackbarComponent
