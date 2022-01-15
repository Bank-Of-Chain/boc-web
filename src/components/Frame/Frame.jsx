import React from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"
// core components
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
// sections for this page
import HeaderLinks from "../../components/Header/HeaderLinks"

// === Styles === //
import styles from "./style"

const useStyles = makeStyles(styles)

export default function Frame (props) {
  const classes = useStyles()
  return (
    <div>
      <Header
        color='transparent'
        brand='Bank Of Chain'
        rightLinks={<HeaderLinks {...props} />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
        {...props}
      />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classes.container}>{props.children}</div>
      </div>
      <Footer whiteFont />
    </div>
  )
}
