import {
  dangerColor,
} from "../../assets/jss/material-kit-react.js";

const style = {
  root: {
    width: '100%',
    margin: "12px 0 8px",
    '& .MuiInputBase-root': {
      color: '#fff',
      borderRadius: '6px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '16px 14px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: dangerColor
    },
  },
  endAdornment: {
    color: "#69c0ff",
    cursor: "pointer"
  },
  endAdornmentActive: {
    color: "#da2eef",
    fontWeight: "bold",
  },
}

export default style
