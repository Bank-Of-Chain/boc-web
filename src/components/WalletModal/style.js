const style = {
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  papar: {
    padding: "28px 32px 32px",
    width: 420,
    borderRadius: 4,
    // border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "rgba(255,255,255, 0.87)",
    background: "#313E40"
  },
  titleWrapper: {
    position: "relative"
  },
  title: {
    fontSize: 18,
    fontWeight: "normal",
    marginTop: 0,
    marginBottom: 24,
    color: "#fff",
  },
  cancelButton: {
    position: "absolute",
    top: "50%",
    right: 0,
    transform: "translate(0, -50%)",
    cursor: "pointer"
  },
  content: {
    display: "flex",
    flexWrap: "wrap"
  },
  walletItemWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 20,
    borderRadius: 4,
    border: "1px solid rgb(228, 228, 231)",
    "&:last-child": {
      marginBottom: 0
    },
    "&:after": {
      display: "none",
      content: "''",
      position: "absolute", 
      top: "50%",
      right: 22,
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "#1976d2",
    }
  },
  walletItem: {
    padding: 16,
    cursor: "pointer",
  },
  walletItemWrapperSelected: {
    border: "1px solid rgb(228, 228, 231)",
    "&:after": {
      display: "block"
    }
  },
  walletLogo: {
    width: 24,
    marginRight: 8,
    verticalAlign: "middle"
  },
  walletName: {
    verticalAlign: "middle",
    lineHeight: "24px"
  }
}

export default style