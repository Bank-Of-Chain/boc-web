import {
  container,
} from "../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  center: {
    justifyContent: 'center',
    padding: '50px 72px 50px',
    backgroundColor: "#0c0735cc",
    [theme.breakpoints.down("md")]: {
      padding: '50px 16px 50px',
    },
    margin: 0
  },
  main: {
    position: "relative",
    backgroundColor: 'transparent'
  },
  mainRaised: {
    margin: "0 auto",
    marginTop: 130,
    marginBottom: 100,
    borderRadius: "6px",
  },
});

export default componentsStyle;
