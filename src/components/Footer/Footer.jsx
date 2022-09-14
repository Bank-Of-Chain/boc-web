import React from 'react'
import classNames from 'classnames'
import { List, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import IconButton from '@material-ui/core/IconButton'
import SvgIcon from '@material-ui/core/SvgIcon'
import Divider from '@material-ui/core/Divider'

// === Constants === //
import { COMMUNITY_URL, DOCUMENT_URL, TELEGRAM_URL, TWITTER_URL, LINKEDIN_URL } from '@/constants'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import styles from './footerStyle.js'

const useStyles = makeStyles(styles)

const ICON1 = (
  <IconButton>
    <SvgIcon>
      <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.6852 0.971845C20.4772 0.795845 20.2252 0.67887 19.9562 0.63487C19.6872 0.58987 19.4102 0.618854 19.1572 0.718854L1.85022 7.51585C1.54722 7.63085 1.29026 7.84386 1.11926 8.11986C0.948261 8.39586 0.872257 8.72087 0.903257 9.04387C0.932257 9.36687 1.06427 9.67186 1.28027 9.91386C1.49727 10.1559 1.78527 10.3209 2.10327 10.3849L6.50024 11.2559V16.7499C6.50024 17.0469 6.58827 17.3379 6.75427 17.5849C6.91927 17.8319 7.15422 18.0239 7.42822 18.1379C7.61022 18.2109 7.80424 18.2489 8.00024 18.2499C8.19724 18.2509 8.39322 18.2119 8.57422 18.1369C8.75622 18.0609 8.92124 17.9499 9.06024 17.8099L11.4973 15.3809L15.1822 18.6249C15.4542 18.8649 15.8033 18.9979 16.1663 18.9999C16.3253 19.0029 16.4843 18.9778 16.6353 18.9248C16.8823 18.8468 17.1052 18.7049 17.2812 18.5149C17.4572 18.3239 17.5802 18.0909 17.6382 17.8379L21.1633 2.44386C21.2243 2.17786 21.2132 1.90086 21.1282 1.64186C21.0442 1.38186 20.8912 1.15085 20.6852 0.971845ZM16.1752 17.4999L8.45025 10.7029L19.5782 2.66887L16.1752 17.4999Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON2 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M23.1839 12.918L19.9969 2.30598C19.9349 2.09098 19.8259 1.89298 19.6759 1.72798C19.5269 1.56198 19.3409 1.43299 19.1339 1.34999H19.0779L19.1339 1.33097C18.0879 0.911973 17.0049 0.591979 15.8999 0.374979C15.8029 0.354979 15.7039 0.355979 15.6069 0.374979C15.5099 0.393979 15.4189 0.431978 15.3369 0.486978C15.2549 0.541978 15.1849 0.612986 15.1299 0.694986C15.0759 0.776986 15.0379 0.868975 15.0189 0.964975C14.9979 1.06098 14.9969 1.16097 15.0149 1.25697C15.0329 1.35397 15.0699 1.44599 15.1249 1.52799C15.1789 1.60999 15.2489 1.67996 15.3299 1.73496C15.4119 1.78996 15.5029 1.82699 15.5999 1.84599C16.0219 1.93099 16.4339 2.03398 16.8369 2.14598C16.9859 2.22398 17.1039 2.34798 17.1739 2.49998C17.2429 2.65198 17.2599 2.82297 17.2209 2.98597C17.1829 3.14897 17.0899 3.29399 16.9599 3.39799C16.8289 3.50299 16.6669 3.55999 16.4999 3.56199H16.4249C14.9799 3.18499 13.4929 2.99598 11.9999 2.99998C10.5419 2.99498 9.0889 3.17798 7.6779 3.54298C7.4979 3.59098 7.30795 3.56996 7.14195 3.48496C6.97695 3.39896 6.84989 3.25598 6.78489 3.08198C6.71889 2.90798 6.72092 2.71598 6.78892 2.54298C6.85692 2.37098 6.98693 2.22898 7.15293 2.14598H7.1619C7.5649 2.03398 7.97794 1.93099 8.39994 1.84599C8.49594 1.82699 8.5879 1.78896 8.6699 1.73496C8.7519 1.67996 8.82291 1.60999 8.87791 1.52799C8.93291 1.44599 8.97091 1.35497 8.98991 1.25797C9.00891 1.16097 9.00991 1.06198 8.98991 0.964975C8.94991 0.770975 8.8349 0.600969 8.6699 0.489969C8.5049 0.379969 8.30393 0.338979 8.10893 0.374979C6.99993 0.595979 5.91291 0.922985 4.86491 1.34999C4.65791 1.43299 4.47292 1.56198 4.32292 1.72798C4.17392 1.89298 4.06391 2.09098 4.00291 2.30598L0.81492 12.918C0.73292 13.196 0.731944 13.491 0.813944 13.769C0.894944 14.047 1.05494 14.295 1.27494 14.484C1.36094 14.567 1.45191 14.645 1.54691 14.718H1.55595C3.07495 15.956 5.07194 16.903 7.32194 17.446C7.37894 17.465 7.43892 17.474 7.49992 17.475C7.68492 17.478 7.86492 17.412 8.00492 17.29C8.14492 17.168 8.2339 16.998 8.2559 16.814C8.2779 16.63 8.23192 16.444 8.12492 16.293C8.01792 16.141 7.8589 16.034 7.6779 15.993C6.6659 15.749 5.68294 15.4 4.74394 14.953C4.61494 14.832 4.53294 14.67 4.51194 14.495C4.49094 14.32 4.53191 14.144 4.62791 13.996C4.72391 13.848 4.86894 13.739 5.03794 13.688C5.20594 13.637 5.38791 13.646 5.54991 13.715C7.33091 14.503 9.57192 15 11.9999 15C14.4279 15 16.6689 14.503 18.4499 13.715C18.6119 13.646 18.7929 13.637 18.9619 13.688C19.1299 13.739 19.2749 13.848 19.3719 13.996C19.4679 14.144 19.5089 14.32 19.4879 14.495C19.4669 14.67 19.3849 14.832 19.2559 14.953C18.3169 15.4 17.3329 15.749 16.3219 15.993C16.1409 16.034 15.9819 16.141 15.8749 16.293C15.7679 16.444 15.7209 16.63 15.7429 16.814C15.7649 16.998 15.8549 17.168 15.9949 17.29C16.1339 17.412 16.3139 17.478 16.4999 17.475C16.5599 17.474 16.6199 17.465 16.6779 17.446C18.9279 16.903 20.9249 15.956 22.4439 14.718H22.4529C22.5479 14.645 22.6389 14.567 22.7249 14.484C22.9439 14.295 23.1039 14.047 23.1859 13.769C23.2669 13.491 23.2669 13.196 23.1839 12.918ZM8.99992 11.625C8.77692 11.625 8.55992 11.559 8.37492 11.435C8.18992 11.311 8.04594 11.136 7.95994 10.93C7.87494 10.725 7.85291 10.498 7.89591 10.28C7.93991 10.062 8.0469 9.86099 8.2039 9.70399C8.3619 9.54699 8.56195 9.43998 8.77995 9.39598C8.99895 9.35298 9.22491 9.37497 9.42991 9.45997C9.63591 9.54497 9.81192 9.68998 9.93492 9.87498C10.0589 10.06 10.1249 10.277 10.1249 10.5C10.1249 10.798 10.0059 11.084 9.7949 11.295C9.5839 11.506 9.29792 11.625 8.99992 11.625ZM14.9999 11.625C14.7769 11.625 14.5599 11.559 14.3749 11.435C14.1899 11.311 14.0459 11.136 13.9599 10.93C13.8749 10.725 13.8529 10.498 13.8959 10.28C13.9399 10.062 14.0469 9.86099 14.2039 9.70399C14.3619 9.54699 14.5619 9.43998 14.7799 9.39598C14.9989 9.35298 15.2249 9.37497 15.4299 9.45997C15.6359 9.54497 15.8119 9.68998 15.9349 9.87498C16.0589 10.06 16.1249 10.277 16.1249 10.5C16.1249 10.798 16.0059 11.084 15.7949 11.295C15.5839 11.506 15.2979 11.625 14.9999 11.625Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON3 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M23.1009 3.238C23.0069 3.112 22.8749 3.018 22.7239 2.971C22.5729 2.924 22.4119 2.92601 22.2619 2.97601C21.3419 3.28601 20.3859 3.475 19.4169 3.54C18.8709 2.77 18.0959 2.19199 17.2019 1.88699C16.3079 1.58199 15.3419 1.566 14.4379 1.841C13.5349 2.116 12.7409 2.668 12.1689 3.419C11.5969 4.17 11.2749 5.08199 11.2499 6.02599C9.78592 5.72799 8.39694 5.14199 7.16294 4.30099C5.92894 3.45999 4.87594 2.38098 4.06394 1.12798C3.98494 1.00698 3.87294 0.910982 3.74094 0.851982C3.60894 0.792982 3.4629 0.773982 3.3209 0.795982C3.1779 0.817982 3.04493 0.880982 2.93693 0.976982C2.82893 1.07298 2.75093 1.198 2.71293 1.337C2.05293 3.719 2.0999 6.24198 2.8469 8.59798C3.5929 10.955 5.00795 13.044 6.91795 14.612C5.31095 15.497 3.5099 15.973 1.6749 15.999C1.5099 16.002 1.34989 16.059 1.21989 16.161C1.08989 16.264 0.997923 16.406 0.957923 16.567C0.917923 16.727 0.931925 16.896 0.996925 17.048C1.06292 17.2 1.17694 17.326 1.32194 17.406C3.20094 18.446 5.31389 18.995 7.46189 19.001C9.61089 19.007 11.7259 18.47 13.6119 17.44C15.4969 16.41 17.0919 14.921 18.2479 13.11C19.4039 11.298 20.0829 9.22499 20.2239 7.08099C21.3429 6.25799 22.3199 5.257 23.1149 4.117C23.2059 3.988 23.2529 3.83299 23.2509 3.67599C23.2479 3.51799 23.1959 3.365 23.1009 3.238Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON4 = (
  <IconButton>
    <SvgIcon>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.5 0H1.5C1.102 0 0.721002 0.159002 0.440002 0.440002C0.159002 0.721002 0 1.102 0 1.5V16.5C0 16.898 0.159002 17.279 0.440002 17.56C0.721002 17.841 1.102 18 1.5 18H16.5C16.898 18 17.279 17.841 17.56 17.56C17.841 17.279 18 16.898 18 16.5V1.5C18 1.102 17.841 0.721002 17.56 0.440002C17.279 0.159002 16.898 0 16.5 0ZM6 13.5C6 13.699 5.92103 13.89 5.78003 14.03C5.64003 14.171 5.449 14.25 5.25 14.25C5.051 14.25 4.85997 14.171 4.71997 14.03C4.57897 13.89 4.5 13.699 4.5 13.5V7.5C4.5 7.301 4.57897 7.11 4.71997 6.97C4.85997 6.829 5.051 6.75 5.25 6.75C5.449 6.75 5.64003 6.829 5.78003 6.97C5.92103 7.11 6 7.301 6 7.5V13.5ZM5.25 5.625C5.027 5.625 4.81 5.559 4.625 5.435C4.44 5.312 4.296 5.136 4.211 4.931C4.125 4.725 4.10297 4.49901 4.14697 4.28101C4.18997 4.06201 4.29702 3.86199 4.45502 3.70499C4.61202 3.54699 4.81201 3.44 5.03101 3.397C5.24901 3.353 5.47503 3.376 5.68103 3.461C5.88603 3.546 6.062 3.69 6.185 3.875C6.309 4.06 6.375 4.278 6.375 4.5C6.375 4.798 6.25598 5.08499 6.04498 5.29599C5.83498 5.50699 5.548 5.625 5.25 5.625ZM14.25 13.5C14.25 13.699 14.171 13.89 14.03 14.03C13.89 14.171 13.699 14.25 13.5 14.25C13.301 14.25 13.11 14.171 12.97 14.03C12.829 13.89 12.75 13.699 12.75 13.5V10.125C12.75 9.628 12.552 9.15101 12.201 8.79901C11.849 8.44801 11.372 8.25 10.875 8.25C10.378 8.25 9.90101 8.44801 9.54901 8.79901C9.19801 9.15101 9 9.628 9 10.125V13.5C9 13.699 8.92103 13.89 8.78003 14.03C8.64003 14.171 8.449 14.25 8.25 14.25C8.051 14.25 7.85997 14.171 7.71997 14.03C7.57897 13.89 7.5 13.699 7.5 13.5V7.5C7.5 7.316 7.56798 7.138 7.69098 7C7.81298 6.863 7.98302 6.775 8.16602 6.755C8.34902 6.734 8.53302 6.782 8.68402 6.888C8.83402 6.995 8.94002 7.15401 8.98102 7.33301C9.48802 6.98901 10.08 6.789 10.692 6.755C11.304 6.722 11.914 6.85501 12.456 7.14301C12.998 7.43001 13.451 7.85901 13.767 8.38501C14.083 8.91001 14.25 9.512 14.25 10.125V13.5Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)

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
          <GridItem xs={12} sm={12} md={4} className={classNames(classes.item, {
            [classes.left]: !isLayoutSm,
            [classes.center]: isLayoutSm
          })}>
            <a className={classes.title} rel="noopener noreferrer" href="/#/">
              <img alt="" src="/logo.svg" style={{ width: 228, height: 36 }} />
            </a>
          </GridItem>
          <GridItem xs={12} sm={12} md={8} className={classNames(classes.item, {
            [classes.right]: !isLayoutSm,
            [classes.center]: isLayoutSm
          })}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a
                  className={classes.block}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${DOCUMENT_URL}/docs/protocol-mechanisms/protocol-algorithm-design`}
                >
                  BoC Protocol
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={'https://governance.bankofchain.io'}>
                  Governance
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={DOCUMENT_URL}>
                  Docs
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a
                  className={classes.block}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${DOCUMENT_URL}/docs/protocol-mechanisms/security-risk`}
                >
                  Security
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={`${DOCUMENT_URL}/docs/more/faqs`}>
                  FAQ
                </a>
              </ListItem>
            </List> 
          </GridItem>
          <Divider />
          <GridItem xs={12} sm={12} md={5} className={classNames(classes.item, {
            [classes.left]: !isLayoutSm,
            [classes.center]: isLayoutSm
          })}>
            <p className={classes.text}>@{1900 + new Date().getYear()} Bank of Chain, all rights reserved.</p>
          </GridItem>
          <GridItem xs={12} sm={12} md={7} className={classNames(classes.item, {
            [classes.right]: !isLayoutSm,
            [classes.center]: isLayoutSm
          })}>
            <p>
              Any further queries? Contact us at <a className={classes.email}>contact@bankofchain.io</a>
            </p>
          </GridItem>
          <Divider />
          <GridItem xs={12} sm={12} md={12} className={classNames(classes.item, classes.center)}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={TELEGRAM_URL}>
                  {ICON1}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={COMMUNITY_URL}>
                  {ICON2}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={TWITTER_URL}>
                  {ICON3}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={LINKEDIN_URL}>
                  {ICON4}
                </a>
              </ListItem>
            </List>
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
                BOC OR ITS AFFILIATES, MAKE NO REPRESENTATIONS OR WARRANTIES CONCERNING ANY SERVICES, OR FACILITIES PROVIDED UNDER THE BOC PROTOCOL. ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING WITHOUT LIMITATION ANY AND ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD PARTY RIGHTS) ARE HEREBY. DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.
              </p>
            </GridItem>
          )}
        </GridContainer>
      </div>
    </footer>
  )
}
