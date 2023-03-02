import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import numeral from 'numeral'
import { getHomePageData } from '@/services/api-service'
import { toFixed } from '@/helpers/number-format'
import { BN_18 } from '@/constants/big-number'

// === Components === //
import ProductSection from './components/ProductSection'
import AuditedSection from './components/AuditedSection'
import AmmSection from './components/AmmSection'
import YieldSection from './components/YieldSection'
import LendingSection from './components/LendingSectionV2'
import RoadMapSectionV2 from './components/RoadMapSectionV2'
import SupportMembers from './components/SupportMembers'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'
import SecurityAudits from './components/SecurityAudits'

// === Styles === //
import styles from './landingPage'

const useStyles = makeStyles(styles)

export default function Home() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  const [tvl, setTvl] = useState('-')
  const [holders, setHolders] = useState('-')

  useEffect(() => {
    getHomePageData().then(data => {
      const { totalValueLocked, holders } = data
      setTvl(numeral(toFixed(totalValueLocked, BN_18)).format('0,0 a'))
      setHolders(numeral(holders).format('0,0'))
    })
  }, [])

  return (
    <div className={classes.container}>
      <GridContainer style={{ display: 'none' }}>
        <GridItem xs={12} sm={12} md={12} className={isLayoutSm ? classes.gridMobile : classes.grid}>
          <h1 className={isLayoutSm ? classes.titleMobile : classes.title}>The Multichain</h1>
          <h1 className={isLayoutSm ? classes.titleMobile : classes.title}>Yield Optimizer</h1>
          <h4 className={classes.text} style={{ marginTop: 40 }}>
            BoC is a DeFi protocol that provides the best long-term
            <b> &quot;risk-free&quot; </b>
            return
          </h4>
          <div className={classes.infoWrapper}>
            <ul className={classes.info}>
              <li>
                <div className={classes.infoTitle}>Total Value Locked</div>
                <div className={classes.infoText}>${tvl}</div>
              </li>
              <li style={{ display: 'none' }}>
                <div className={classes.infoTitle}>Holders</div>
                <div className={classes.infoText}>{holders}</div>
              </li>
            </ul>
          </div>
          <p className={classes.text} style={{ marginTop: 40 }}>
            <Button color="colorful-border" size="lg" href="/#/usdi">
              Launch App
            </Button>
          </p>
        </GridItem>
      </GridContainer>
      <LendingSection />
      <ProductSection />
      {/* <LendingSection /> */}
      <YieldSection />
      <AmmSection />
      <SupportMembers />
      <RoadMapSectionV2 />
      <AuditedSection />
      <SecurityAudits />
    </div>
  )
}
