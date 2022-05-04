import {
  container,
} from "../../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
    marginBottom: 24,
    padding: "32px 16px",
    backgroundColor: "rgb(39,31,114)",
    color: "#fff",
    borderRadius: 6,
  },
  img: {
    width: '35px',
    padding: 4
  },
  actionArea:{
    paddingLeft: 10,
    border: '1px solid',
    borderRadius: 4
  }
});

export default componentsStyle;