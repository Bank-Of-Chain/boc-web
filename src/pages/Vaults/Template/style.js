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
    backgroundColor: "#271f72",
    color: "#fff",
    borderRadius: 6,
  },
});

export default componentsStyle;
