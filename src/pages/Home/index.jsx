import React from "react"
// nodejs library that concatenates classes
import classNames from "classnames"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// @material-ui/icons

// core components
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"
import Button from "../../components/CustomButtons/Button"
import Parallax from "../../components/Parallax/Parallax"
import Chains from "../../components/Chains/Chains"

// === Constants === //
import { NET_WORKS } from "./../../constants"

// === Components === //
import ProductSection from "./Sections/ProductSection"
import AuditedSection from "./Sections/AuditedSection"
import AmmSection from "./Sections/AmmSection"
import TvlSection from "./Sections/TvlSection"
import LendingSection from "./Sections/LendingSection"

// === Styles === //
import styles from "./landingPage"

const useStyles = makeStyles(styles)

export default function Home (props) {
  const { changeNetwork } = props
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} style={{ textAlign: "left" }}>
          <h1 className={classes.title}>The Multichain Yield Optimizer</h1>
          <h4 className={classes.text}>
            qweqwrerrwer rewtretyrytrytry trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer
            rewtretyrytrytry trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer rewtretyrytrytry
            trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer rewtretyrytrytry
            trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer rewtretyrytrytry
            trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer rewtretyrytrytry
            trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqwqweqwrerrwer rewtretyrytrytry
            trutyiiyuoyowrwrwerwe qewqeqeqeqweqeqr tetwterteryerryqweqweqw
          </h4>
          <div>
            <Button className={classes.inverst} color='colorfull' size='lg' href='/#/invest'>
              inverst
            </Button>
            <Chains
              maskStyle={{ display: "inline-block", paddingLeft: 10 }}
              array={NET_WORKS}
              handleClick={changeNetwork}
            />
          </div>
          <TvlSection />
        </GridItem>
      </GridContainer>
      <ProductSection />
      <AmmSection />
      <LendingSection />
      <AuditedSection />
    </div>
  )
}
