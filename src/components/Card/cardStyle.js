const cardStyle = {
  card: {
    border: "0",
    marginBottom: "30px",
    marginTop: "30px",
    borderRadius: "6px",
    color: "rgba(0, 0, 0, 0.87)",
    backgroundColor: "rgb(19, 24, 35)",
    width: "100%",
    boxShadow: "0 0px 20px 0 rgb(105 192 255 / 28%), 0 4px 20px 0px rgb(0 0 0 / 12%), 0 7px 8px -5px rgb(105 192 255 / 20%)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minWidth: "0",
    wordWrap: "break-word",
    fontSize: ".875rem",
    transition: "all 300ms linear",
  },
  cardPlain: {
    background: "transparent",
    boxShadow: "none",
  },
  cardCarousel: {
    overflow: "hidden",
  },
};

export default cardStyle;