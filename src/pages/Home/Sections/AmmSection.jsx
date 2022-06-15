import React from "react"
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import Tabs from "../../../components/CustomTabs/CustomTabs"
import GridItem from "../../../components/Grid/GridItem"

// === Constants === //
import AMMS, { PLATFORM_HOME_URL } from "../../../constants/amms"
import CHAINS from "../../../constants/chains"
import STABLECOINS from "../../../constants/stableCoins"

// === Utils === //
import map from "lodash/map"
import isEmpty from "lodash/isEmpty"

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
      <Tabs
        centered
        value={value}
        indicatorColor='primary'
        textColor='primary'
        onChange={handleChange}
        aria-label='disabled tabs example'
        tabs={[
          {
            tabName: "Stablecoins",
            tabContent: (
              <GridItem xs={12} sm={12} md={12} className={classes.iconContainer}>
                {map(STABLECOINS, c => (
                  <div
                    key={c.id}
                    className={`${classes.item}`}
                    onClick={() => window.open(`https://etherscan.io/address/${c.address}`)}
                  >
                    <img className={classes.img} src={`/images/${c.address}.png`} alt={c.symbol} />
                    <p className={classes.text}>{c.symbol}</p>
                  </div>
                ))}
                <div key={"chainlink"} className={classes.item} onClick={() => window.open("https://chain.link")}>
                  <img className={classes.img} src={`/images/oracles/chainlink.png`} alt={"Chainlink"} />
                  <p className={classes.text}>{"Chainlink"}</p>
                </div>
              </GridItem>
            ),
          },
          {
            tabName: "Major chains",
            tabContent: (
              <GridItem xs={12} sm={12} md={12} className={classes.iconContainer}>
                {map(CHAINS, c => (
                  <div key={c.id} className={classes.item} onClick={() => window.open(c.url)}>
                    <img className={`${classes.img} ${classes.transparentBg}`} src={`/images/chains/${c.id}.png`} alt={c.name} />
                    <p className={classes.text}>{c.name}</p>
                  </div>
                ))}
              </GridItem>
            ),
          },
          {
            tabName: "Protocols",
            tabContent: (
              <GridItem xs={12} sm={12} md={12} className={classes.iconContainer}>
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
                      <p className={classes.text}>{a.name}</p>
                    </div>
                  ),
                )}
              </GridItem>
            ),
          },
        ]}
      />
    </div>
  )
}
