const style = {
  roadmap: {
    marginBottom: '11rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '5rem',
    fontWeight: 700,
    textAlign: 'center',
    color: '#fff'
  },
  bottomButton: {
    boxSizing: 'border-box',
    display: 'inline-block',
    height: '8.125rem',
    padding: '0 3.125rem',
    color: '#A68EFE',
    border: '0.375rem solid #A68EFE',
    fontSize: '2.5rem',
    fontWeight: 700,
    borderRadius: '8rem',
    lineHeight: '7.375rem',
    '@media (max-width: 960px)': {
      fontSize: '2rem'
    },
    '@media (max-width: 768px)': {
      fontSize: '1.5rem'
    }
  },
  text: {
    position: 'relative',
    fontSize: '1.375rem',
    textAlign: 'center',
    borderRadius: '12rem',
    margin: '0 auto',
    marginBottom: '5rem'
  },
  textInner: {
    display: 'inline-block',
    marginBottom: 0,
    fontWeight: 700,
    fontSize: '1.1875rem',
    lineHeight: '120%',
    letterSpacing: '0.01em'
  },
  textInnerTitle: {
    padding: '0 10%'
  },
  dataItemContainer: {
    padding: '2rem 2.3rem 0.6rem'
  },
  itemTitle: {
    boxSizing: 'border-box',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50%',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '3.75rem',
    height: '3.75rem',
    letterSpacing: '0.01em',
    lineHeight: '1.1',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  dot: {
    marginTop: '0.5rem'
  }
}

export default style
