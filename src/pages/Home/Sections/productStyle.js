import {
  title
} from "../../../assets/jss/material-kit-react.js";

const productStyle = {
  section: {
    padding: "70px 0",
    textAlign: "center",
  },
  title: {
    ...title,
    marginBottom: "1rem",
    marginTop: "30px",
    minHeight: "32px",
    textDecoration: "none",
    fontSize: '2.25rem',
    lineHeight: '1.5em'
  },
  description: {
    color: "#fff",
    fontSize: '1.0625rem',
    lineHeight: '1.55em',
    textAlign: "left",
  },
  descriptionItem: {
    display: 'inline-block'
  }
};

export default productStyle;