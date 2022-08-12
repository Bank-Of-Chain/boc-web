import {
  defaultFont,
  infoColor,
  infoBoxShadow,
  successColor,
  successBoxShadow,
  warningColor,
  warningBoxShadow,
  dangerColor,
  dangerBoxShadow,
  roseColor,
  roseBoxShadow,
} from "@/assets/jss/material-kit-react.js";

const customDropdownStyle = (theme) => ({
  popperClose: {
    pointerEvents: "none",
  },
  dropdown: {
    borderRadius: "12px",
    border: "0",
    top: "100%",
    zIndex: "1000",
    minWidth: "160px",
    padding: "5px 0",
    margin: "2px 0 0",
    fontSize: "14px",
    textAlign: "left",
    listStyle: "none",
    background: "#292b2e",
    backgroundClip: "padding-box",
    boxShadow: "0 0 0px 1px rgba(161, 161, 161, 0.2)",
  },
  menuList: {
    padding: "0",
  },
  popperResponsive: {
    zIndex: "1200",
    [theme.breakpoints.down("sm")]: {
      zIndex: "1640",
      position: "static",
      float: "none",
      width: "auto",
      marginTop: "0",
      backgroundColor: "transparent",
      border: "0",
      boxShadow: "none",
      color: "black",
    },
  },
  dropdownItem: {
    ...defaultFont,
    fontSize: "13px",
    padding: "10px 20px",
    margin: "0 5px",
    borderRadius: "2px",
    position: "relative",
    transition: "all 150ms linear",
    display: "block",
    clear: "both",
    fontWeight: "400",
    height: "fit-content",
    color: "#A0A0A0",
    whiteSpace: "nowrap",
    minHeight: "unset",
  },
  blackHover: {
    "&:hover": {
      boxShadow:
        "0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(33, 33, 33, 0.4)",
      backgroundColor: "#212121",
      color: "#fff",
    },
  },
  primaryHover: {
    "&:hover": {
      background: "#323438",
      color: "#A68EFE",
    },
  },
  infoHover: {
    "&:hover": {
      backgroundColor: infoColor,
      color: "#FFFFFF",
      ...infoBoxShadow,
    },
  },
  successHover: {
    "&:hover": {
      backgroundColor: successColor,
      color: "#FFFFFF",
      ...successBoxShadow,
    },
  },
  warningHover: {
    "&:hover": {
      backgroundColor: warningColor,
      color: "#FFFFFF",
      ...warningBoxShadow,
    },
  },
  dangerHover: {
    "&:hover": {
      backgroundColor: dangerColor,
      color: "#FFFFFF",
      ...dangerBoxShadow,
    },
  },
  roseHover: {
    "&:hover": {
      backgroundColor: roseColor,
      color: "#FFFFFF",
      ...roseBoxShadow,
    },
  },
  dropdownItemRTL: {
    textAlign: "right",
  },
  dropdownDividerItem: {
    margin: "5px 0",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    height: "1px",
    overflow: "hidden",
  },
  buttonIcon: {
    width: "24px !important",
    height: "24px !important",
  },
  dropdownTrigger: {
    "&.MuiButtonBase-root.MuiButton-root": {
      paddingRight: "8px",
    },
  },
  caret: {
    transition: "all 150ms ease-in",
    display: "inline-block",
    marginLeft: "4px",
    verticalAlign: "middle",
  },
  caretActive: {
    transform: "rotate(180deg)",
  },
  caretRTL: {
    marginRight: "4px",
  },
  dropdownHeader: {
    display: "block",
    padding: "0.1875rem 1.25rem",
    fontSize: "0.75rem",
    lineHeight: "1.428571",
    color: "#777",
    whiteSpace: "nowrap",
    fontWeight: "inherit",
    marginTop: "10px",
    minHeight: "unset",
    "&:hover,&:focus": {
      backgroundColor: "transparent",
      cursor: "auto",
    },
  },
  noLiPadding: {
    padding: "0",
  },
});

export default customDropdownStyle;
