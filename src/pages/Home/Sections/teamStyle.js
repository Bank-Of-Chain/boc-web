import { cardTitle, title } from "../../../assets/jss/material-kit-react";
import imagesStyle from "../imagesStyles";

const teamStyle = {
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
  ...imagesStyle,
  itemGrid: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  cardTitle,
  smallTitle: {
    color: "#6c757d",
  },
  description: {
    color: "#999",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.5em',
    textAlign: 'center'
  },
  justifyCenter: {
    justifyContent: "center !important",
  },
  socials: {
    marginTop: "0",
    width: "100%",
    transform: "none",
    left: "0",
    top: "0",
    height: "100%",
    lineHeight: "41px",
    fontSize: "20px",
    color: "#999",
  },
  margin5: {
    margin: "5px",
  },
};

export default teamStyle;
