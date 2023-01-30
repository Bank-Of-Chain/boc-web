const componentsStyle = () => ({
  table: {
    minWidth: 650
  },
  tokenLogo: {
    width: '3rem',
    borderRadius: '50%',
    marginRight: 8
  },
  item: {
    color: '#9595B2',
    display: 'block',
    padding: '24px',
    position: 'relative',
    background: 'rgb(0 0 0 / 20%)',
    borderBottom: 'solid 2px #363B63',
    textDecoration: 'none'
  },
  inner: {
    width: '100%',
    display: 'grid',
    rowGap: '24px',
    columnGap: '24px',
    gridTemplateColumns: '1fr'
  },
  header: {
    display: 'flex',
    flexGrow: 0,
    minWidth: 0,
    columnGap: '16px',
    flexShrink: 0,
    flexDirection: 'row'
  },
  icon: {
    display: 'flex',
    position: 'relative',
    flexGrow: 0,
    transform: 'translate(0, 0)',
    alignItems: 'center',
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  text: {
    minWidth: 0,
    lineHeight: '3rem',
    fontWeight: 'bold',
    letterSpacing: '3px'
  },
  body: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  bodyInner: {
    width: '100%',
    display: 'grid',
    rowGap: '24px',
    columnGap: '24px',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
  },
  bodyItem: {
    display: 'block'
  },
  bodyItemTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  content: {
    color: '#D0D0DA',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
    textTransform: 'none',
    marginTop: '0.5rem'
  },
  apyText: {
    color: '#DB8332'
  },
  footer: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  footerInner: {
    width: '100%',
    display: 'grid',
    rowGap: '24px',
    columnGap: '24px',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
  }
})

export default componentsStyle
