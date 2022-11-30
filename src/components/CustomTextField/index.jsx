import React from 'react'
import classNames from 'classnames'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import styles from './style'

const useStyles = makeStyles(styles)

function CustomTextField({
  classes = {},
  variant = 'outlined',
  maxEndAdornment = false,
  onMaxClick = () => {},
  isMax = false,
  InputProps = { classes: {} },
  disabled,
  ...restProps
}) {
  const styleClasses = useStyles()
  const { root: rootClass, ...restClass } = classes
  const { classes: InputPropsClasses = {} } = InputProps
  const { root: rootInputClass, ...restInputClass } = InputPropsClasses

  return (
    <TextField
      classes={{
        root: classNames(styleClasses.root, rootClass),
        ...restClass
      }}
      InputProps={{
        ...InputProps,
        classes: {
          root: classNames(styleClasses.inputRoot, rootInputClass),
          ...restInputClass
        },
        endAdornment: maxEndAdornment ? (
          <span
            className={classNames(styleClasses.endAdornment, {
              [styleClasses.endAdornmentActive]: isMax
            })}
            onClick={() => {
              if (disabled) {
                return
              }
              onMaxClick()
            }}
          >
            Max.
          </span>
        ) : null
      }}
      variant={variant}
      disabled={!!disabled}
      {...restProps}
    />
  )
}

export default CustomTextField
