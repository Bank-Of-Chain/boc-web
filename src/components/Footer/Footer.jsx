/*eslint-disable*/
import React from "react"
// nodejs library to set properties for components
import PropTypes from "prop-types"
// nodejs library that concatenates classes
import classNames from "classnames"
// material-ui core components
import { List, ListItem } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

// === Components === //
import GridContainer from "../../components/Grid/GridContainer"
import GridItem from "../../components/Grid/GridItem"

// === Constants === //
import { COMMUNITY_URL, TELEGRAM_URL } from "./../../constants"

import styles from "./footerStyle.js"

const useStyles = makeStyles(styles)

export default function Footer (props) {
  const classes = useStyles()
  const { whiteFont } = props
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont,
  })
  const aClasses = classNames({
    [classes.a]: true,
    [classes.footerWhiteFont]: whiteFont,
  })
  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <GridContainer>
          <GridItem xs={6} sm={6} md={6}>
            This project is in beta. Use at your own risk.
          </GridItem>
          <GridItem xs={6} sm={6} md={6}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={COMMUNITY_URL}>
                  Discord
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={TELEGRAM_URL}>
                  TELEGRAM
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank'>
                  Copyright@{1900 + new Date().getYear()}
                </a>
              </ListItem>
            </List>
          </GridItem>
          <GridItem xs={6} sm={6} md={6}>
            This project is in beta. Use at your own risk.
          </GridItem>
          <GridItem xs={6} sm={6} md={6}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={COMMUNITY_URL}>
                  Discord
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={TELEGRAM_URL}>
                  TELEGRAM
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank'>
                  Copyright@{1900 + new Date().getYear()}
                </a>
              </ListItem>
            </List>
          </GridItem>

          <GridItem xs={12} sm={12} md={12}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={COMMUNITY_URL}>
                  Discord
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank' href={TELEGRAM_URL}>
                  TELEGRAM
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target='_blank'>
                  Copyright@{1900 + new Date().getYear()}
                </a>
              </ListItem>
            </List>
          </GridItem>
        </GridContainer>
      </div>
    </footer>
  )
}
