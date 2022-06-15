const lendingSectionStyle = {
  section: {
    padding: "3.5rem",
  },
  text: {
    color: "#1cd9ff",
  },
  item: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  body: {
    height: "20rem",
    marginLeft: 0,
    marginRight: 0,
  },
  header: {
    height: "18.75rem",
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: "1px solid rgba(255, 255, 255, .1)",
    borderLeft: "1px solid rgba(255, 255, 255, .1)",
  },
  bar: {
    width: "3rem",
    background: "#FE3DCE",
    margin: "auto",
    cursor: "pointer",
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    "&>p": {
      position: "absolute",
      top: "-3rem",
      left: "50%",
      transform: "translate(-50%, 0)",
      zIndex: 1,
      fontSize: "1rem",
    },
  },
  fixed: {
    background: "#A68EFE",
  },
  footer: {
    textAlign: "center",
    paddingLeft: 0,
    paddingRight: 0,
    "&>img": {
      width: "3rem",
      height: "3rem",
      borderRadius: "1.5rem",
      marginTop: "1.25rem",
    },
    "&>p": {
      fontSize: "1rem",
    },
  },
  label: {
    float: "right",
    textAlign: "left",
    width: "10rem",
    paddingTop: "2rem",
  },
  box: {
    height: "0.6rem",
    width: "0.6rem",
    borderRadius: "50%",
    marginRight: "0.25rem",
    display: "inline-block",
    background: "#A68EFE",
  },
  box1: {
    height: "0.6rem",
    width: "0.6rem",
    borderRadius: "50%",
    marginRight: "0.25rem",
    display: "inline-block",
    background: "#FE3DCE",
  },
  chart: {
    background: "linear-gradient(199.32deg, #FE3DCE 17.59%, #5B93DF 71.04%, #94E3FF 102.04%)",
    borderRadius: "1rem",
    padding: "2px",
  },
  chartInner: {
    padding: "7.5rem 0",
    backgroundColor: "#070b10",
    borderRadius: "1rem",
  },
}

export const smStyle = {
  section: {
    padding: "3.5rem 0.5rem",
  },
  bar: {
    width: "1.8rem",
    "&>p": {
      fontSize: "0.8125rem",
    },
  },
  footer: {
    "&>img": {
      width: "1.8rem",
      height: "1.8rem",
      borderRadius: "0.9rem",
    },
    "&>p": {
      transform: "rotateZ(45deg)",
      fontSize: "0.875rem",
      paddingBottom: "0.6rem",
      paddingLeft: "0.6rem",
      textAlign: "left",
    },
  },
}

export default lendingSectionStyle
