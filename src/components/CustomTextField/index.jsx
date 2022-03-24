import React from "react"
import classNames from "classnames"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"
import styles from "./style"

const useStyles = makeStyles(styles)

function CustomTextField ({
  classes = {},
  variant = "outlined",
  maxEndAdornment = false,
  onMaxClick = () => {},
  isMax = false,
  ...restProps
}) {
  const styleClasses = useStyles()
  const { root: rootClass, ...restClass } = classes
  console.log(isMax)

  return (
    <TextField
      classes={{
        root: classNames(styleClasses.root, rootClass),
        ...restClass
      }}
      InputProps={{
        endAdornment: maxEndAdornment ? (
          <span
            className={classNames(styleClasses.endAdornment, {
              [styleClasses.endAdornmentActive]: isMax
            })}
            onClick={onMaxClick}
          >
            Max
          </span>
        ) : null
      }}
      variant={variant}
      {...restProps}
    />
  )
}

export default CustomTextField
