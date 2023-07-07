const productStyle = {
  section: {
    textAlign: 'center',
    background: 'url(/images/home/bg-gradient.webp) no-repeat center',
    padding: '13rem 0'
  },
  text: {
    color: '#1F2023',
    margin: '0 0 3rem 0',
    fontSize: '4.375rem'
  },
  swiper: {
    boxSizing: 'border-box',
    position: 'relative',
    width: '68.75rem',
    padding: '0 4rem',
    margin: '0 auto'
  },
  item: {
    display: 'flex',
    padding: '1.25rem',
    borderRadius: '1rem',
    marginTop: '1.25rem',
    backgroundColor: '#1E1E1F'
  },
  img: {
    display: 'flex',
    width: '3.75rem',
    alignItems: 'center'
  },
  info: {
    flex: 1,
    paddingLeft: '1.875rem',
    textAlign: 'left'
  },
  title: {
    fontSize: '1.375rem'
  },
  description: {
    fontSize: '0.875rem'
  },
  '@media screen and (max-width: 960px)': {
    swiper: {
      width: '100%'
    }
  }
}

export default productStyle
