import {
  container
} from "../../assets/jss/material-kit-react.js";

const componentsStyle = {
  container,
  center: {
    justifyContent: 'center',
    padding: '50px 20px'
  },
  brand: {
    color: "#FFFFFF",
    textAlign: "left"
  },
  title: {
    fontSize: "4.2rem",
    fontWeight: "600",
    display: "inline-block",
    position: "relative",
  },
  subtitle: {
    fontSize: "1.313rem",
    width: 'auto',
    margin: "10px 0 0",
  },
  main: {
    position: "relative",
    backgroundColor: 'transparent'
  },
  mainRaised: {
    margin: "250px 30px 30px 30px",
    borderRadius: "6px",
  },
  link: {
    textDecoration: "none",
  },
  textCenter: {
    textAlign: "center",
  },
  switchIcon: {
    color: '#40a9ff !important'
  },
  switchBar: {
    backgroundColor: '#91d5ff !important'
  },
  tooltip: {
    padding: "10px 15px",
    minWidth: "130px",
    color: "#555555",
    lineHeight: "1.7em",
    background: "#FFFFFF",
    border: "none",
    borderRadius: "3px",
    boxShadow: "0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2)",
    maxWidth: "200px",
    textAlign: "center",
    fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    fontSize: "0.875em",
    fontStyle: "normal",
    fontWeight: "400",
    textShadow: "none",
    textTransform: "none",
    letterSpacing: "normal",
    wordBreak: "normal",
    wordSpacing: "normal",
    wordWrap: "normal",
    whiteSpace: "normal",
    lineBreak: "auto",
  },
  img: {
    width: '25px'
  },
  radioUnchecked: {
    width: "0px",
    height: "0px",
    padding: "7px",
    border: "1px solid #fff",
    borderRadius: "50%",
  },
  radioChecked: {
    width: "16px",
    height: "16px",
    border: "1px solid #fff",
    borderRadius: "50%",
  },
  radioRoot: {
    padding: "12px",
    "&:hover": {
      backgroundColor: "unset",
    },
  },
  radio: {
    color: "#fff !important",
  },
  table: {
    backgroundColor: '#150752',
    border: '1px solid rgb(222, 217, 213)',
  },
  tableCell: {
    color: '#fff',
    fontSize: '12px',
    letterSpacing: '0.01071em'
  }
};

export default componentsStyle;