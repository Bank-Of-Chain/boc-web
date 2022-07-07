import React, { useState } from "react";
import classNames from "classnames";
import map from "lodash/map";
import find from "lodash/find";
import isArray from "lodash/isArray";
import { makeStyles } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import styles from "./style";

const useStyles = makeStyles(styles);

function Select({ value, onChange = () => {}, options = [] }) {
  const [popVisible, setPopVisible] = useState(false);
  const classes = useStyles();
  const selectedOpt = find(options, (opt) => opt.value === value) || {};
  const handleClickAway = () => {
    setPopVisible(false);
  };

  const handleTogglePop = () => {
    setPopVisible(!popVisible);
  };

  const handlePopSelect = (value) => {
    setPopVisible(false);
    onChange(value);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={classes.selectWrapper}>
        <div className={classes.selectTrigger} onClick={handleTogglePop}>
          <div className={classes.triggerLabelWrapper}>
            {selectedOpt.img &&
              (!isArray(selectedOpt.img) ? (
                <img
                  className={classes.optImg}
                  src={selectedOpt.img}
                  alt="logo"
                />
              ) : (
                <div className={classes.optMultiImgWrapper}>
                  {map(selectedOpt.img, (img) => (
                    <img
                      key={img}
                      className={classes.optMultiImg}
                      src={img}
                      alt="logo"
                    />
                  ))}
                </div>
              ))}
            <span className={classes.triggerLabel}>{selectedOpt.label}</span>
          </div>
          <ExpandMoreIcon
            className={classNames(classes.caret, {
              [classes.expandLess]: popVisible,
            })}
          />
        </div>
        <ul
          className={classNames(classes.selectPop, {
            [classes.selectPopVisible]: popVisible,
          })}
        >
          {map(options, (opt) => (
            <li
              key={opt.value}
              className={classNames(classes.selectItem, {
                [classes.selectActiveItem]: value === opt.value,
              })}
              onClick={() => handlePopSelect(opt.value)}
            >
              {opt.img &&
                (!isArray(opt.img) ? (
                  <img className={classes.optImg} src={opt.img} alt="logo" />
                ) : (
                  <div className={classes.optMultiImgWrapper}>
                    {map(opt.img, (img) => (
                      <img
                        key={img}
                        className={classes.optMultiImg}
                        src={img}
                        alt="logo"
                      />
                    ))}
                  </div>
                ))}
              <span className={classes.optLabel}>{opt.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </ClickAwayListener>
  );
}

export default Select;
