const style = {
  selectWrapper: {
    position: "relative",
    height: "32px"
  },
  selectTrigger: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    cursor: "pointer"
  },
  triggerLabel: {
    color: "#fff"
  },
  selectPop: {
    display: "none",
    position: "absolute",
    left: 0,
    top: "100%",
    marginTop: "6px",
    padding: "8px 0",
    opacity: 0,
    zIndex: 100,
    background: "#fff",
    borderRadius: "4px",
    boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
    transition: "opacity 0.4s"
  },
  selectPopVisible: {
    display: "block",
    opacity: 1,
  },
  selectItem: {
    display: "flex",
    alignItems: "center",
    padding: "6px 16px",
    cursor: "pointer",

    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)"
    }
  },
  selectActiveItem: {
    backgroundColor: "rgba(0, 0, 0, 0.08)"
  },
  optImg: {
    width: "auto",
    height: "32px",
    marginRight: "8px",
    borderRadius: "50%",
  },
  optLabel: {
    color: "rgba(0, 0, 0, 0.87)",
  },
}

export default style
