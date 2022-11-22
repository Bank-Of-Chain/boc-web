import React from 'react'
import classNames from 'classnames'
import { List, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import TelegramIcon from '@/components/HoverIcon/icons/Telegram'
import DiscordIcon from '@/components/HoverIcon/icons/Discord'
import TwitterIcon from '@/components/HoverIcon/icons/Twitter'
import LinkedInIcon from '@/components/HoverIcon/icons/LinkedIn'
import YoutubeIcon from '@/components/HoverIcon/icons/Youtube'
import MediumIcon from '@/components/HoverIcon/icons/Medium'
import GithubIcon from '@/components/HoverIcon/icons/Github'
import Button from '@/components/CustomButtons/Button'

// === Constants === //
import { COMMUNITY_URL, DOCUMENT_URL, TELEGRAM_URL, TWITTER_URL, LINKEDIN_URL, YOUTUBE_URL, MEDIUM_URL, GITHUB_URL } from '@/constants'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import styles from './footerStyle.js'

const useStyles = makeStyles(styles)

export default function Footer(props) {
  const classes = useStyles()
  const { whiteFont } = props
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  })

  const isHomePage = window.location.hash === '#/'
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <GridContainer>
          <GridItem
            xs={12}
            sm={12}
            md={4}
            className={classNames(classes.item, {
              [classes.left]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <div className={classes.social}>
              <TelegramIcon href={TELEGRAM_URL} />
              <DiscordIcon href={COMMUNITY_URL} />
              <TwitterIcon href={TWITTER_URL} />
              <LinkedInIcon href={LINKEDIN_URL} />
              <YoutubeIcon href={YOUTUBE_URL} />
              <MediumIcon href={MEDIUM_URL} />
              <GithubIcon href={GITHUB_URL} />
            </div>
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={8}
            className={classNames(classes.item, {
              [classes.right]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <Button
                  color="colorful-text"
                  target="_blank"
                  href={`${DOCUMENT_URL}/docs/protocol-mechanisms/protocol-algorithm-design`}
                  disableRipple={true}
                >
                  BoC Protocol
                </Button>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <Button color="colorful-text" target="_blank" href={`${DOCUMENT_URL}/docs/governance/governance`} disableRipple={true}>
                  Governance
                </Button>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <Button color="colorful-text" target="_blank" href={DOCUMENT_URL} disableRipple={true}>
                  Docs
                </Button>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <Button color="colorful-text" target="_blank" href={`${DOCUMENT_URL}/docs/protocol-mechanisms/security-risk`} disableRipple={true}>
                  Security
                </Button>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <Button color="colorful-text" target="_blank" href={`${DOCUMENT_URL}/docs/more/faqs`} disableRipple={true}>
                  FAQ
                </Button>
              </ListItem>
            </List>
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={5}
            className={classNames(classes.item, {
              [classes.left]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <p className={classes.text}>@{1900 + new Date().getYear()} Bank of Chain, all rights reserved.</p>
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={7}
            className={classNames(classes.item, {
              [classes.right]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <p>
              <span className={classes.query}>Any further queries?</span> Contact us at <a className={classes.email}>contact@bankofchain.io</a>
            </p>
          </GridItem>
          {isHomePage && (
            <GridItem xs={12} sm={12} md={12} className={classNames(classes.item, classes.disclaimer)}>
              <p>DISCLAIMER</p>
              <p>
                Bank of Chain (“BoC”) is a decentralized yield generation protocol designed for the community to invest in the DeFi investment
                ecosystem. BoC is a non-audited, open-source protocol, which includes a set of smart contracts that are deployed on the Ethereum
                Blockchain and Polygon networks respectively. Your use of the BoC protocol involves various risks, including, but not limited to,
                losses due to the fluctuation of prices of tokens in a vault, trading pair, liquidity pool, lending contracts, or any other smart
                contracts (“Risks”). Your use of BoC shall be at your own risk. Please remember to not invest more than what you can afford to lose.
                Before using BoC, you are expected to review the relevant documentation, ensuring that you fully understand how the BoC protocol
                works. BoC or its affiliates shall not be liable for any losses you may suffer arising from the use of BoC or due to the Risks.
              </p>
              <p>
                BOC OR ITS AFFILIATES, MAKE NO REPRESENTATIONS OR WARRANTIES CONCERNING ANY SERVICES, OR FACILITIES PROVIDED UNDER THE BOC PROTOCOL.
                ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING WITHOUT LIMITATION ANY AND ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD PARTY RIGHTS) ARE HEREBY. DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE
                LAW.
              </p>
            </GridItem>
          )}
        </GridContainer>
      </div>
    </footer>
  )
}
