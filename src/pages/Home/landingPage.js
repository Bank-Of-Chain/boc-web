import {
  container,
} from "../../assets/jss/material-kit-react.js";

const landingPageStyle = {
  container: {
    zIndex: "12",
    color: "#FFFFFF",
    marginTop: 65,
    ...container,
  },
  title: {
    display: "inline-block",
    position: "relative",
    margin: "88px 0 0 0",
    minHeight: "32px",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: '3.3125rem',
    lineHeight: '1.15em',
  },
  subtitle: {
    fontSize: "1.313rem",
    maxWidth: "500px",
    margin: "10px auto 0"
  },
  text: {
    fontWeight: 300,
    fontSize: '1.4rem',
    lineHeight: '1.5em',
    marginTop: '2.6rem',
    color: '#fff',
  },
  ull: {
    '&>li': {
      fontSize: '1.4rem',
      lineHeight: '2.5rem',
      listStyleType:'square'
    }
  },
  main: {
    background: "#FFFFFF",
    position: "relative",
    zIndex: "3",
  },
  mainRaised: {
    margin: "-60px 30px 0px",
    borderRadius: "6px",
    backgroundColor: "transparent"
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
    width: '56px',
    height: '56px',
    marginRight: 'auto',
    maxWidth: '100%',
    padding: 2,
    verticalAlign: 'middle',
    background: '#fff',
    marginLeft: 10,
    cursor: 'pointer'
  },
  inverst: {
    width: '14.875rem',
    height: '5.25rem',
    borderRadio: '0.25rem',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
};

export default landingPageStyle;