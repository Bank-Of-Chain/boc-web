import { gradientText } from '@/assets/jss/common.js'

const componentsStyle = () => ({
  container: {
    maxWidth: '75rem',
    color: '#FFFFFF',
    padding: '3.125rem 3.125rem 0',
    margin: '6rem auto'
  },
  wrapper: {
    padding: '1.875rem',
    borderRadius: '2.5rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%);'
  },
  wrapperMobile: {
    padding: '3rem 2rem',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)'
  },
  symbol: {
    color: '#A68EFD',
    marginLeft: '1rem',
    ...gradientText
  },
  item: {
    color: '#fff',
    marginBottom: 20,
    '& .MuiListItemIcon-root': {
      minWidth: '38px'
    }
  },
  balanceCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: '0.5rem',
    textAlign: 'left',
    padding: '2.8125rem 2.4375rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    color: '#fff',
    borderRadius: '1.25rem'
  },
  check: {
    color: '#A68EFE',
    '&>span': {
      fontWeight: '700',
      '&:hover': {
        letterSpacing: '0.03rem'
      }
    }
  },
  balanceCardValue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 30,
    lineHeight: '30px',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  balanceCardLabel: {
    color: '#b2add1',
    fontSize: 14
  },
  tokenInfo: {
    display: 'flex',
    position: 'absolute',
    right: 12,
    top: 9
  },
  addTokenIcon: {
    cursor: 'pointer',
    marginLeft: '1rem',
    display: 'flex'
  },
  title: {
    fontSize: '4.2rem',
    fontWeight: '600',
    display: 'inline-block',
    position: 'relative'
  },
  img: {
    width: '25px'
  },
  text: {
    color: 'azure',
    '&>span:hover': {
      fontWeight: 'bold',
      letterSpacing: '0.03rem'
    }
  },
  notConnect: {
    display: 'flex',
    flexDirection: 'column',
    height: '20rem',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    fontSize: '1.25rem'
  },
  textBottom: {
    marginTop: '0.25rem'
  }
})

export default componentsStyle
