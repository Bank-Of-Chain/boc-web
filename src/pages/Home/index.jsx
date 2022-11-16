import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Components === //
import ProductSection from './components/ProductSection'
import AuditedSection from './components/AuditedSection'
import AmmSection from './components/AmmSection'
import YieldSection from './components/YieldSection'
import LendingSection from './components/LendingSection'
import RoadMapSectionV2 from './components/RoadMapSectionV2'
import SupportMembers from './components/SupportMembers'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Button from '@/components/CustomButtons/Button'

// === Styles === //
import styles from './landingPage'

const useStyles = makeStyles(styles)

export default function Home() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  return (
    <div className={classes.container}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} className={isLayoutSm ? classes.gridMobile : classes.grid}>
          <h1 className={isLayoutSm ? classes.titleMobile : classes.title}>The Multichain</h1>
          <h1 className={isLayoutSm ? classes.titleMobile : classes.title}>Yield Optimizer</h1>
          <h4 className={classes.text} style={{ marginTop: 40 }}>
            BoC is a DeFi protocol that
          </h4>
          <h4 className={classes.text}>
            provides the best long-term
            <b> &quot;risk-free&quot; </b>
            return
          </h4>
          <p className={classes.text} style={{ marginTop: 40 }}>
            <Button className={classes.invest} color="colorfull-border" size="lg" href="/#/mutils">
              Launch App
            </Button>
          </p>
        </GridItem>
      </GridContainer>
      <ProductSection />
      <LendingSection />
      <YieldSection />
      <AmmSection />
      <SupportMembers />
      <RoadMapSectionV2 />
      <AuditedSection />
    </div>
  )
}
