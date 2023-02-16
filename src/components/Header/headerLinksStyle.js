import { defaultFont } from '@/assets/jss/material-kit-react.js'

import tooltip from './tooltipsStyle.js'

const headerLinksStyle = theme => ({
  list: {
    ...defaultFont,
    fontSize: '14px',
    margin: 0,
    padding: '0',
    listStyle: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    '& > li + li': {
      marginLeft: '1.25rem'
    }
  },
  listItem: {
    float: 'left',
    color: 'inherit',
    position: 'relative',
    display: 'block',
    width: 'auto',
    margin: '0',
    padding: '0',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      '&:after': {
        width: 'calc(100% - 30px)',
        content: '""',
        display: 'block',
        height: '1px',
        marginLeft: '15px',
        backgroundColor: '#e5e5e5'
      }
    }
  },
  hidden: {
    display: 'none'
  },
  listItemText: {
    padding: '0 !important'
  },
  navLink: {
    color: '#fff',
    position: 'relative',
    fontWeight: '400',
    textTransform: 'initial',
    borderRadius: '3px',
    lineHeight: '20px',
    textDecoration: 'none',
    margin: '0px',
    display: 'inline-flex',
    '&:hover,&:focus': {
      color: '#fff'
    },
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 30px)',
      marginLeft: '15px',
      marginBottom: '8px',
      marginTop: '8px',
      textAlign: 'left',
      '& > span:first-child': {
        justifyContent: 'flex-start'
      }
    }
  },
  colorfulLink: {
    fontSize: '16px',
    padding: '7px 16px',
    textTransform: 'none',
    margin: '11px 20px',
    borderRadius: '5px',
    [theme.breakpoints.down('sm')]: {
      height: '48px'
    }
  },
  accountLink: {
    position: 'relative',
    paddingRight: '9px',
    paddingLeft: '36px',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '18px',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      transform: 'translate(0, -50%)',
      background: '#55E752'
    }
  },
  notificationNavLink: {
    color: 'inherit',
    padding: '0.9375rem',
    fontWeight: '400',
    fontSize: '12px',
    textTransform: 'uppercase',
    lineHeight: '20px',
    textDecoration: 'none',
    margin: '0px',
    display: 'inline-flex',
    top: '4px'
  },
  registerNavLink: {
    top: '3px',
    position: 'relative',
    fontWeight: '400',
    fontSize: '12px',
    textTransform: 'uppercase',
    lineHeight: '20px',
    textDecoration: 'none',
    margin: '0px',
    display: 'inline-flex'
  },
  navLinkActive: {
    color: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  icons: {
    width: '24px !important',
    height: '24px !important',
    marginRight: '3px'
  },
  socialIcons: {
    position: 'relative',
    fontSize: '20px !important',
    marginRight: '4px'
  },
  dropdownLink: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    '&,&:hover,&:focus': {
      color: 'inherit',
      textDecoration: 'none',
      padding: '6px 14px'
    }
  },
  dropdownLinkText: {
    marginLeft: '8px',
    fontFamily: 'DM Sans'
  },
  ...tooltip,
  marginRight5: {
    marginRight: '5px'
  }
})

export default headerLinksStyle
