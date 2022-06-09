import React, { Fragment } from "react"

// === Components === //
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import HeaderLinks from "../../components/Header/HeaderLinks"

export default function Frame (props) {
  return (
    <Fragment>
      <Header
        color='transparent'
        brand='Bank Of Chain'
        rightLinks={<HeaderLinks {...props} />}
        fixed
        changeColorOnScroll={{
          height: 90,
          color: "white",
        }}
        {...props}
      />
      {props.children}
      <Footer whiteFont />
    </Fragment>
  )
}
