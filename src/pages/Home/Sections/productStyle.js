import {
  title
} from "../../../assets/jss/material-kit-react.js";

const productStyle = {
  section: {
    textAlign: "center",
    backgroundColor: '#261964',
    padding: '1.625rem',
    opacity: '0.7'
  },
  title: {
    ...title,
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0
  },
  description: {
    fontSize: '0.875rem',
    color: '#fff',
    display: 'inline-block',
    lineHeight: '2rem'
  },
};

export default productStyle;