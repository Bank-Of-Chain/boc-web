import React, { useState } from 'react'
import classNames from 'classnames'
import map from 'lodash-es/map'
import find from 'lodash-es/find'
import isArray from 'lodash-es/isArray'
import { makeStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import styles from './style-v2'

const useStyles = makeStyles(styles)

function SimpleSelectV2({ value, onChange = () => {}, options = [], disabled, className }) {
  const [popVisible, setPopVisible] = useState(false)
  const classes = useStyles()
  const selectedOpt = find(options, opt => opt.value === value) || {}
  const handleClickAway = () => {
    setPopVisible(false)
  }

  const handleTogglePop = () => {
    if (disabled) return
    setPopVisible(!popVisible)
  }

  const handlePopSelect = value => {
    setPopVisible(false)
    onChange(value)
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={classNames(classes.selectWrapper, className)}>
        <div
          className={classNames(classes.selectTrigger, {
            [classes.disabled]: disabled
          })}
          onClick={handleTogglePop}
        >
          <div className={classes.triggerLabelWrapper}>
            {selectedOpt.img &&
              (!isArray(selectedOpt.img) ? (
                <img className={classes.optImg} src={selectedOpt.img} alt="logo" />
              ) : (
                <div className={classes.optMultiImgWrapper}>
                  {map(selectedOpt.img, img => (
                    <img key={img} className={classes.optMultiImg} src={img} alt="logo" />
                  ))}
                </div>
              ))}
            <span className={classes.triggerLabel}>{selectedOpt.label}</span>
          </div>
          {!disabled && (
            <ExpandMoreIcon
              className={classNames(classes.caret, {
                [classes.expandLess]: popVisible
              })}
            />
          )}
        </div>
        <ul
          className={classNames(classes.selectPop, {
            [classes.selectPopVisible]: popVisible
          })}
        >
          {map(options, opt => (
            <li
              key={opt.key || opt.value}
              className={classNames(classes.selectItem, {
                [classes.selectActiveItem]: value === opt.value
              })}
              onClick={() => handlePopSelect(opt.value)}
            >
              <span className={classNames(classes.optLabel, classes.endDont)}>
                {opt.img &&
                  (!isArray(opt.img) ? (
                    <img className={classes.optImg} src={opt.img} alt="logo" />
                  ) : (
                    <div className={classes.optMultiImgWrapper}>
                      {map(opt.img, img => (
                        <img key={img} className={classes.optMultiImg} src={img} alt="logo" />
                      ))}
                    </div>
                  ))}
                {opt.label}
              </span>
              <span className={classes.endDont}>{opt.endDont}</span>
            </li>
          ))}
        </ul>
      </div>
    </ClickAwayListener>
  )
}

export default SimpleSelectV2
