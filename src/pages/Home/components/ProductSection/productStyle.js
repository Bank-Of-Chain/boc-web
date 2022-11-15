const productStyle = {
  section: {
    textAlign: 'center',
    background: '#F6F6F6 linear-gradient(219.17deg, #e3f8ff 24.63%, #ffc7f1 104.13%)',
    padding: '13rem 0 10rem'
  },
  text: {
    color: '#1F2023',
    margin: '0 0 5rem 0',
    fontSize: '3.75rem'
  },
  title: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0
  },
  item: {
    cursor: 'pointer',
    padding: '0 0 10px 10px',
    background: '#313036',
    borderRadius: '1rem',
    marginLeft: '1rem'
  },
  swiper: {
    position: 'relative',
    width: 'calc(100% - 29.75rem)',
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
