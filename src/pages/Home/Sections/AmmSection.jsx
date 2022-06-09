import React from "react"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import GridContainer from "../../../components/Grid/GridContainer"
import GridItem from "../../../components/Grid/GridItem"

// === Constants === //
import AMMS, { PLATFORM_HOME_URL } from "../../../constants/amms"
import CHAINS from "../../../constants/chains"
import STABLECOINS from "../../../constants/stableCoins"

// === Utils === //
import map from "lodash/map"
import isEmpty from "lodash/isEmpty"
import groupBy from "lodash/groupBy"
import values from "lodash/values"

// === Styles === //
import styles from "./ammStyle"

const useStyles = makeStyles(styles)

export default function AmmSection () {
  const classes = useStyles()
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  function imgError (e) {
    const evn = e
    const img = evn.srcElement ? evn.srcElement : evn.target
    img.src = "/default.png"
  }

  return (
    <div className={classes.section}>
      <h2>Major integrations</h2>
      <h4 className={classes.title}>
        Bank of Chain is integrated with the 3 major chains for DeFi, the world’s top 7 stablecoins, and is optimized
        among 58 AMM and lending pools
      </h4>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Tabs
            centered
            value={value}
            indicatorColor='primary'
            textColor='primary'
            onChange={handleChange}
            aria-label='disabled tabs example'
          >
            <Tab label='Stablecoins' />
            <Tab label='Major chains' />
            <Tab label='Protocols' />
          </Tabs>
        </GridItem>
        {value === 0 && (
          <GridItem xs={12} sm={12} md={12}>
            {map(CHAINS, c => (
              <div key={c.id} className={classes.item} onClick={() => window.open(c.url)}>
                <img className={classes.img} src={`/images/chains/${c.id}.png`} alt={c.name} />
                <span className={classes.text}>{c.name}</span>
              </div>
            ))}
          </GridItem>
        )}

        {value === 1 && (
          <GridItem xs={12} sm={12} md={12}>
            {map(STABLECOINS, c => (
              <div
                key={c.id}
                className={`${classes.item}`}
                onClick={() => window.open(`https://etherscan.io/address/${c.address}`)}
              >
                <img className={classes.img} src={`/images/${c.address}.png`} alt={c.symbol} />
                <span className={classes.text}>{c.symbol}</span>
              </div>
            ))}
            <div key={"chainlink"} className={classes.item} onClick={() => window.open("https://chain.link")}>
              <img className={classes.img} src={`/images/oracles/chainlink.png`} alt={"Chainlink"} />
              <span className={classes.text}>{"Chainlink"}</span>
            </div>
          </GridItem>
        )}
        {value === 2 && (
          <GridItem xs={12} sm={12} md={12}>
            {map(
              map(AMMS, (item, i) => {
                return {
                  name: item,
                  index: i,
                  url: PLATFORM_HOME_URL[item],
                }
              }),
              a => (
                <div key={a.name} className={classes.item} onClick={() => !isEmpty(a.url) && window.open(a.url)}>
                  <img className={classes.img} src={`/images/amms/${a.name}.png`} alt={a.name} onError={imgError} />
                  <span className={classes.text}>{a.name}</span>
                </div>
              ),
            )}
          </GridItem>
        )}
      </GridContainer>
    </div>
  )
}
