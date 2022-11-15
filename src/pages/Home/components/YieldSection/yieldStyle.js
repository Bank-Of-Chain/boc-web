import { gradientText } from '@/assets/jss/common.js'

const yieldStyle = {
  yieldSection: {
    width: '80%',
    maxWidth: '1127px',
    margin: '0 auto',
    padding: '172px 0 198px'
  },
  title: {
    fontSize: '100px',
    fontWeight: 'bold',
    margin: 0
  },
  '@media screen and (max-width: 923px)': {
    title: {
      fontSize: '3.4rem'
    }
  },
  svg: {
    verticalAlign: 'middle'
  },
  colorful: {
    ...gradientText,
    fontWeight: 'bold'
  },
  text: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  subTitle: {
    fontSize: '26px',
    lineHeight: '36px',
    margin: '16px 0 32px'
  },
  description: {
    fontSize: '20px',
    margin: 0,
    lineHeight: '30px'
  },
  sourceList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '36px'
  },
  sourceItem: {
    display: 'flex',
    alignItems: 'center',
    height: '72px',
    lineHeight: '72px',
    fontSize: '20px',
    borderTop: '1px solid #fff',
    '&:last-child': {
      borderBottom: '1px solid #fff'
    }
  },
  checkIcon: {
    fontSize: '28px',
    color: '#A68EFE',
    marginLeft: '2rem',
    marginRight: '3rem'
  }
}

export default yieldStyle
