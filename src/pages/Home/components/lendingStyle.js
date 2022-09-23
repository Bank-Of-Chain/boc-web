import { gradientText } from '@/assets/jss/common.js'

const lendingSectionStyle = {
  section: {
    maxWidth: '93rem',
    padding: '3.5rem 4rem',
    margin: '0 auto'
  },
  colorful: {
    ...gradientText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '1.5rem'
  },
  text: {
    color: '#1cd9ff'
  },
  title: {
    fontSize: '3.75rem'
  },
  item: {
    paddingLeft: 0,
    paddingRight: 0
  },
  body: {
    marginLeft: 0,
    marginRight: 0,
    paddingTop: '1.5rem'
  },
  header: {
    paddingLeft: 0,
    paddingRight: 0
  },
  bar: {
    height: '3.4rem',
    float: 'left',
    cursor: 'pointer',
    margin: 'auto',
    background: '#FE3DCE',
    borderRadius: '0.3rem'
  },
  percent: {
    float: 'right',
    marginRight: '-3.5rem'
  },
  fixed: {
    background: '#A68EFE'
  },
  footer: {
    textAlign: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    '&>img': {
      width: '3rem',
      height: '3rem',
      borderRadius: '1.5rem'
      // marginTop: '1.25rem'
    },
    '&>p': {
      fontSize: '1rem',
      margin: 0
    }
  },
  label: {
    float: 'right',
    width: '10rem',
    textAlign: 'left',
    marginTop: '-6rem'
  },
  box: {
    height: '0.6rem',
    width: '0.6rem',
    borderRadius: '50%',
    marginRight: '1rem',
    display: 'inline-block',
    background: '#FE3DCE'
  },
  box1: {
    height: '0.6rem',
    width: '0.6rem',
    borderRadius: '50%',
    marginRight: '1rem',
    display: 'inline-block',
    background: '#A68EFE'
  },
  chart: {
    background: 'linear-gradient(199.32deg, #FE3DCE 17.59%, #5B93DF 71.04%, #94E3FF 102.04%)',
    borderRadius: '1rem',
    padding: '2px'
  },
  chartInner: {
    backgroundColor: '#313036',
    borderRadius: '1rem'
  },
  block: {
    width: '100%',
    marginBottom: '2rem'
  }
}

export const smStyle = {
  section: {
    padding: '3.5rem 3rem'
  },
  bar: {
    width: '1.8rem',
    '&>p': {
      fontSize: '0.8125rem'
    }
  },
  footer: {
    '&>img': {
      width: '1.8rem',
      height: '1.8rem',
      borderRadius: '0.9rem'
    },
    '&>p': {
      // transform: 'rotateZ(45deg)',
      // fontSize: '0.875rem',
      // paddingBottom: '0.6rem',
      // paddingLeft: '0.6rem',
      // textAlign: 'left'
    }
  }
}

export default lendingSectionStyle
