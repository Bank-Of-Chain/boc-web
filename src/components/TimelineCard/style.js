const style = {
  timelineCard: {
    position: "relative",
    display: "inline-block",
    width: "332px",
    height: "110px",
    padding: "1px",
    borderRadius: "4px",
    background: "linear-gradient(219.17deg, #94E3FF 24.63%, #FE3DCE 104.13%)",
  },
  colorReverse: {
    background:
      "linear-gradient(220.48deg, #FE3DCE 6.75%, #5B93E0 99.99%, #94E3FF 100%)",
    "& $arrow": {
      borderColor: "#7087dd",
    },
    "& $arrowRight": {
      borderColor: "#da50d2",
    },
  },
  content: {
    position: "relative",
    display: "flex",
    height: "100%",
    margin: 0,
    padding: "24px 36px",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#313036",
    borderRadius: "4px",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "26px",
    boxSizing: "border-box",
    zIndex: 1,
  },
  arrow: {
    position: "absolute",
    top: "50%",
    width: "14px",
    height: "14px",
    marginTop: "-7px",
    transform: "rotate(45deg)",
    zIndex: 0,
    backgroundColor: "#313036",
    border: "1px solid #d779e0",
  },
  arrowLeft: {
    left: "-7px",
  },
  arrowRight: {
    right: "-7px",
    borderColor: "#9ed4fb",
  },
  "@media (max-width: 992px)": {
    timelineCard: {
      width: "260px",
    },
  },
  "@media (max-width: 768px)": {
    timelineCard: {
      width: "172px",
    },
    content: {
      padding: "24px 8px",
    },
    separator: {
      marginLeft: "8px",
      marginRight: "8px",
    },
  },
};

export default style;
