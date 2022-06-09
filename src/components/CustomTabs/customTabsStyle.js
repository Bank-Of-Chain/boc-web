const customTabsStyle = {
  cardTitle: {
    float: "left",
    padding: "10px 10px 10px 0px",
    lineHeight: "24px",
  },
  cardTitleRTL: {
    float: "right",
    padding: "10px 0px 10px 10px !important",
  },
  displayNone: {
    display: "none !important",
  },
  tabsRoot: {
    minHeight: "unset !important",
  },
  tabRootButton: {
    width: "17.5rem",
    padding: "10px 15px",
    lineHeight: "24px",
    border: "1px solid #A68EFE",
    borderRight: 0,
    fontWeight: "500",
    fontSize: "12px",
    color: "#A68EFE",
    "&:last-child": {
      borderRight: "1px solid #A68EFE",
      marginLeft: "0px",
    },
  },
  tabSelected: {
    background: "#A68EFE",
    color: "#313036",
  },
  tabWrapper: {
    fontSize: 20,
    whiteSpace: "nowrap",
    margin: ".3125rem 1px",
    display: "inline-block",
    minHeight: "unset !important",
    minWidth: "unset !important",
    width: "unset !important",
    height: "unset !important",
    maxWidth: "unset !important",
    maxHeight: "unset !important",
    "& > svg": {
      verticalAlign: "middle",
      margin: "-1.55px 5px 0 0 !important",
    },
    "&,& *": {
      letterSpacing: "normal !important",
    },
  },
}

export default customTabsStyle
