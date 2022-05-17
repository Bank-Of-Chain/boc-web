import React from "react"
import map from "lodash/map"
import classNames from "classnames"

import { makeStyles } from "@material-ui/core/styles"
import Modal from "@material-ui/core/Modal"
import Paper from "@material-ui/core/Paper"
import CloseIcon from "@material-ui/icons/Close"
import { useDispatch } from "react-redux"
import { WALLET_OPTIONS } from "../../constants/wallet"
import { warmDialog } from "../../reducers/meta-reducer"

import styles from "./style"

const useStyles = makeStyles(styles)

export default function WalletModal({
  open,
  onClose,
  connectTo,
  selected
}) {
  const classes = useStyles()
  const dispatch = useDispatch()

  const handleConnect = (name) => {
    connectTo(name).then(console.log).catch(error => {
      console.error('connect wallet error', error)
      dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: "Please install the wallet first. If you have installed, reload the page and retry",
        })
      )
    })
  }

  return (
    <Modal
      className={classes.modal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={open}
      onClose={onClose}
    >
      <Paper
        elevation={3}
        className={classes.papar}
      >
        <div className={classes.titleWrapper}>
          <h3 className={classes.title}>Select a Wallet</h3>
          <CloseIcon onClick={onClose} className={classes.cancelButton} />
        </div>
        <div className={classes.content}>
          {map(WALLET_OPTIONS, (wallet) => (
            <div
              key={wallet.value}
              className={classNames(classes.walletItemWrapper, {
                [classes.walletItemWrapperSelected]: selected === wallet.symbol
              })}
            >
              <div className={classes.walletItem} onClick={() => handleConnect(wallet.value)}>
                <img className={classes.walletLogo} src={wallet.logo} alt="wallet logo" />
                <span className={classes.walletName}>{wallet.name}</span>
              </div>
            </div>
          ))}
        </div>
      </Paper>
    </Modal>
  )
} 
