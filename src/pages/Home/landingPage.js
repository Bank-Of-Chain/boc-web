import { container } from "../../assets/jss/material-kit-react.js";

const landingPageStyle = {
  container: {
    zIndex: "12",
    color: "#FFFFFF",
    marginTop: "6rem",
    ...container,
  },
  "@media (max-width: 960px)": {
    container: {
      marginTop: "84px",
    },
  },
  subtitle: {
    fontSize: "1.313rem",
    maxWidth: "500px",
    margin: "10px auto 0",
  },
  title: {
    fontSize: "9rem",
    width: "80%",
    margin: "0 auto",
    lineHeight: "9rem",
  },
  titleMobile: {
    fontSize: "6rem",
    width: "80%",
    margin: "0 auto",
    lineHeight: "6rem",
  },
  text: {
    margin: 0,
    textAlign: "center",
    fontSize: "20px",
    lineHeight: "30px",
    fontWeight: "normal",
  },
  ull: {
    "&>li": {
      fontSize: "1.4rem",
      lineHeight: "2.5rem",
      listStyleType: "square",
    },
  },
  main: {
    background: "#FFFFFF",
    position: "relative",
    zIndex: "3",
  },
  mainRaised: {
    margin: "-60px 30px 0px",
    borderRadius: "6px",
    backgroundColor: "transparent",
  },
  tooltip: {
    padding: "10px 15px",
    minWidth: "130px",
    color: "#555555",
    lineHeight: "1.7em",
    background: "#FFFFFF",
    border: "none",
    borderRadius: "3px",
    boxShadow:
      "0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2)",
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
    width: "56px",
    height: "56px",
    marginRight: "auto",
    maxWidth: "100%",
    padding: 2,
    verticalAlign: "middle",
    background: "#fff",
    marginLeft: 10,
    cursor: "pointer",
  },
  invest: {
    width: "17.5rem",
    height: "3.625rem",
    fontSize: "1rem",
    textTransform: "none",
  },
  grid: {
    padding: "15rem 0",
    textAlign: "center",
    background: "#1F2023 url(/images/home/bg-line.png) no-repeat center",
  },
  gridMobile: {
    padding: "5rem 0",
    textAlign: "center",
    background: "#1F2023 url(/images/home/bg-line.png) no-repeat center",
  },
};

export default landingPageStyle;
