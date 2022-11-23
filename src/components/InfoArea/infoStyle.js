import { primaryColor, warningColor, dangerColor, successColor, infoColor, roseColor, grayColor } from '@/assets/jss/material-kit-react.js'

const infoStyle = {
  iconWrapper: {
    '& svg': {
      width: '6.25rem',
      height: '6.25rem'
    }
  },
  primary: {
    color: primaryColor
  },
  warning: {
    color: warningColor
  },
  danger: {
    color: dangerColor
  },
  success: {
    color: successColor
  },
  info: {
    color: infoColor
  },
  rose: {
    color: roseColor
  },
  gray: {
    color: grayColor
  },
  icon: {
    width: '36px',
    height: '36px'
  },
  descriptionWrapper: {
    color: grayColor,
    overflow: 'hidden',
    marginTop: '3.125rem'
  },
  title: {
    color: '#fff',
    fontSize: '1.875rem',
    lineHeight: '2.5rem'
  },
  description: {
    color: '#fff',
    overflow: 'hidden',
    margin: '1.5rem 0 0 0',
    fontSize: '0.875rem',
    lineHeight: '1.5em',
    textAlign: 'center'
  },
  iconWrapperVertical: {
    float: 'none'
  },
  iconVertical: {
    width: '61px',
    height: '61px'
  },
  infoArea: {
    cursor: 'pointer',
    padding: '6rem 3rem 3rem',
    background: '#1E1E1F',
    borderRadius: '1rem',
    boxSizing: 'border-box'
  }
}

export default infoStyle
