import {
  dangerColor,
  container,
} from "../../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    textAlign: "center"
  },
  depositContainer: {
    padding: "36px 20px 0",
  },
  tokenInputWrapper: {
    marginBottom: '16px'
  },
  inputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  depositComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 24
  },
  textField: {
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
  tokenInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  tokenLogo: {
    width: 32,
    borderRadius: '50%',
    marginRight: 8
  },
  tokenName: {
    fontSize: "16px",
    color: '#fff'
  }
});

export default componentsStyle;
