const style = {
  selectWrapper: {
    position: "relative",
    height: "51px",
    lineHeight: "51px",
  },
  selectTrigger: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "200px",
    height: "100%",
    cursor: "pointer",
    border: "1px solid #666666",
    borderRadius: "20px",
    paddingLeft: 16,
    paddingRight: 24,
  },
  triggerLabelWrapper: {
    display: "flex",
    alignItems: "center",
  },
  triggerLabel: {
    color: "#A0A0A0",
    fontWeight: "bold",
  },
  caret: {
    color: "#A68EFE",
    transition: "all 150ms ease-in",
  },
  expandLess: {
    transform: "rotate(180deg)",
  },
  selectPop: {
    display: "none",
    position: "absolute",
    left: "50%",
    top: "100%",
    minWidth: "206px",
    marginTop: "12px",
    padding: "8px 0",
    zIndex: 100,
    background: "#292b2e",
    borderRadius: "12px",
    transformOrigin: "top",
    transform: "translate(-50%, 0)",
    boxShadow: "0 0 0px 1px rgba(161, 161, 161, 0.2)",
  },
  selectPopVisible: {
    display: "block",
  },
  selectItem: {
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    cursor: "pointer",

    "&:hover": {
      background: "#323438",
    },
  },
  optImg: {
    width: "auto",
    height: "30px",
    marginRight: "8px",
    borderRadius: "50%",
  },
  optMultiImgWrapper: {
    height: "30px",
    whiteSpace: "nowrap",
  },
  optMultiImg: {
    width: "auto",
    height: "30px",
    borderRadius: "50%",
    marginLeft: "-12px",
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: "8px",
    },
  },
  optLabel: {
    color: "#A0A0A0",
  },
};

export default style;
