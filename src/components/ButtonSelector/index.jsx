import React from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import map from "lodash/map";
import styles from "./style";

const useStyles = makeStyles(styles);

export default function ButtonSelector({
  options = [0.25, 0.5, 0.75, 1],
  onClick = () => {},
}) {
  const classes = useStyles();
  const handleClick = (value) => {
    onClick(value);
  };
  return (
    <div className={classes.buttonSelectorWrapper}>
      {map(options, (opt) => (
        <Button
          key={opt}
          classes={{
            root: classes.buttonRoot,
            outlined: classes.buttonOutlined,
          }}
          size="small"
          variant="outlined"
          onClick={() => handleClick(opt)}
        >
          {`${opt * 100}%`}
        </Button>
      ))}
    </div>
  );
}
