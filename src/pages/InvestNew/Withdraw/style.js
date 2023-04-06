import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  switchBar: {
    backgroundColor: '#91d5ff !important'
  },
  img: {
    width: '25px'
  },
  switchBase: {
    color: '#ddd'
  },
  switchChecked: {
    color: '#40a9ff'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    textAlign: 'center'
  },
  swapBody: {
    width: '42rem',
    outline: 0
  },
  withdrawContainer: {
    padding: '1.25rem',
    borderTopLeftRadius: '1.25rem',
    borderTopRightRadius: '1.25rem'
  },
  outputContainer: {
    padding: '1.25rem',
    marginTop: '0.625rem'
  },
  maxlossContainer: {
    padding: '1.25rem',
    marginTop: '0.625rem',
    borderBottomLeftRadius: '1.25rem',
    borderBottomRightRadius: '1.25rem'
  },
  slippageTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  estimateText: {
    height: '1.25rem',
    color: '#A0A0A0',
    margin: 0,
    display: 'flex',
    marginTop: '0.5rem',
    alignItems: 'center'
  },
  inputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectorlWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0'
  },
  depositComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  tokenInfo: {
    display: 'flex',
    height: '100%',
    alignItems: 'center'
  },
  receiveTokenItem: {
    marginBottom: 0
  },
  settingBtn: {
    color: '#39d0d8',
    textAlign: 'right',
    lineHeight: '36px',
    padding: '10px 0',
    marginRight: '16px'
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: '0.01071em',
    lineHeight: 1.5,
    textAlign: 'center',
    width: '100%'
  },
  settingItem: {
    height: 38,
    lineHeight: '38px',
    marginBottom: 16,
    '&:first-child': {
      marginTop: 24
    }
  },
  settingItemLabel: {
    position: 'relative',
    minWidth: 100,
    marginRight: 16,
    textAlign: 'right'
  },
  mutedLabel: {
    position: 'relative',
    display: 'inline-block'
  },
  maxLossFormCtrl: {
    width: '160px'
  },
  exchanged: {
    position: 'relative',
    paddingLeft: 16
  },
  tooltip: {
    fontSize: '14px'
  },
  slippageItem: {
    display: 'flex',
    alignItems: 'center'
  },
  slippageInput: {
    width: 96,
    marginLeft: 16
  },
  widthdrawLoadingPaper: {
    padding: '1.25rem',
    maxWidth: '500px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#1f1d27',
    borderRadius: '1rem',
    width: '100%',
    outline: 0
  },
  root: {
    padding: '1.25rem',
    borderRadius: '0 0 1.25rem 1.25rem',
    marginTop: '0.625rem',
    backgroundColor: '#313036'
  },
  setting: {
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    cursor: 'pointer'
  },
  popover: {
    width: '15rem',
    background: '#292B2E',
    border: ' 1px solid #666666',
    borderRadius: '1.25rem',
    padding: '1rem'
  },
  popoverTitle: {
    color: '#A0A0A0',
    margin: 0,
    padding: '0.5rem 0'
  },
  estimateItem: {
    textAlign: 'center',
    minHeight: '100px',
    color: '#A0A0A0',
    paddingTop: '35px'
  },
  tokenName: {
    fontSize: '1.625rem'
  },
  blockButton: {
    padding: '1.25rem 0',
    borderRadius: 20
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.25rem',
    borderRadius: '1.25rem 1.25rem 0 0',
    backgroundColor: '#313036',
    color: '#DADADA'
  },
  text: {
    marginLeft: '0.5rem'
  },
  cancelButton: {
    height: '3.625rem',
    lineHeight: '3.375rem',
    padding: 0,
    borderRadius: '1.25rem',
    marginTop: '0.625rem'
  }
})

export default componentsStyle
