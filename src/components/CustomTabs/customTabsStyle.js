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
    maxWidth: "17.5rem",
    padding: "0.625rem 1rem",
    lineHeight: "1.5rem",
    border: "2px solid #A68EFE",
    borderRight: 0,
    fontWeight: "500",
    fontSize: "1rem",
    color: "#A68EFE",
    opacity: 1,
    "&:first-child": {
      borderRadius: "0.25rem 0 0 0.25rem",
    },
    "&:last-child": {
      borderRight: "2px solid #A68EFE",
      marginLeft: "0px",
      borderRadius: "0 0.25rem 0.25rem 0",
    },
  },
  tabSelected: {
    background: "#A68EFE",
    color: "#313036",
  },
  tabWrapper: {
    fontSize: "1rem",
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
    textTransform: "none",
  },
}

export default customTabsStyle
