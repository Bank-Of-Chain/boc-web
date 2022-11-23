const productStyle = {
  section: {
    textAlign: 'center',
    background: 'url(/images/home/bg-gradient.png) no-repeat center',
    padding: '13rem 0'
  },
  text: {
    color: '#1F2023',
    margin: '0 0 3rem 0',
    fontSize: '4.375rem'
  },
  title: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0
  },
  swiper: {
    boxSizing: 'border-box',
    position: 'relative',
    width: '68.75rem',
    padding: '0 4rem',
    margin: '0 auto'
  },
  '@media screen and (max-width: 1333px)': {
    swiper: {
      width: 'calc(100% - 15rem)'
    }
  }
}

export default productStyle
