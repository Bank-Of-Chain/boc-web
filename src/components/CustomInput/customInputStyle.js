import {
  primaryColor,
  dangerColor,
  successColor,
  defaultFont,
} from "../../assets/jss/material-kit-react.js";

const customInputStyle = {
  disabled: {
    "&:before": {
      borderColor: "transparent !important",
    },
  },
  underline: {
    "&:hover:not($disabled):before,&:before": {
      borderColor: "#D2D2D2 !important",
      borderWidth: "1px !important",
    },
    "&:after": {
      borderColor: primaryColor,
    },
  },
  underlineError: {
    "&:after": {
      borderColor: dangerColor,
    },
  },
  underlineSuccess: {
    "&:after": {
      borderColor: successColor,
    },
  },
  whiteUnderline: {
    "&:hover:not($disabled):before,&:before": {
      borderColor: "#FFFFFF",
    },
    "&:after": {
      borderColor: "#FFFFFF",
    },
  },
  labelRoot: {
    ...defaultFont,
    color: "#fff !important",
    fontWeight: "400",
    fontSize: "18px",
    top: "10px",
    whiteSpace: "nowrap",
    letterSpacing: '0.01071em', 
    "& + $underline": {
      // marginTop: "0px",
    },
  },
  labelRootError: {
    color: dangerColor + " !important",
  },
  labelRootSuccess: {
    color: successColor + " !important",
  },
  formControl: {
    margin: "0 0 17px 0",
    paddingTop: "30px",
    position: "relative",
    "& svg,& .fab,& .far,& .fal,& .fas,& .material-icons": {
      color: "#495057",
    },
  },
  labelTextEmpty: {
    paddingTop: 0,
    margin: 0
  },
  input: {
    color: "#fff",
    height: "unset",
    "&,&::placeholder": {
      fontSize: "16px",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: "400",
      opacity: "1",
    },
    "&::placeholder": {
      color: "#bbb"
    },
  },
  whiteInput: {
    "&,&::placeholder": {
      color: "#fff",
      opacity: "1",
    },
  },
};

export default customInputStyle;