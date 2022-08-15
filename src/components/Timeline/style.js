const style = {
  timelineWrapper: {
    position: 'relative',
    width: '100%'
  },
  topInfo: {
    width: '278px',
    height: '56px',
    lineHeight: '56px',
    border: '1px solid #A68EFE',
    margin: '0 auto',
    textAlign: 'center',
    borderRadius: '4px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#A68EFE'
  },
  events: {
    position: 'relative',
    width: '100%'
  },
  connector: {
    position: 'absolute',
    left: '50%',
    width: '1px',
    height: '100%',
    transform: 'translate(-50%, 0)',
    background: 'linear-gradient(0, rgba(32, 32, 35, 0) 0%, #BEBEBE 100%)'
  },
  connectorColorRevese: {
    background: 'linear-gradient(180deg, rgba(32, 32, 35, 0) 0%, #BEBEBE 100%)'
  },
  timeline: {
    padding: '46px 16px',
    margin: 0
  },
  timelineItem: {
    margin: '28px 0'
  },
  hidden: {
    display: 'none'
  },
  keyTime: {
    position: 'relative',
    top: '50%',
    margin: 0,
    color: '#A0A0A0',
    fontSize: '20px',
    lineHeight: '30px',
    transform: 'translate(0, -50%)'
  },
  separator: {
    margin: '0 24px'
  },
  dot: {
    position: 'relative',
    top: '50%',
    width: '6px',
    height: '6px',
    margin: 0,
    background: '#A0A0A0',
    transform: 'translate(0, -50%)'
  },
  '@media (max-width: 768px)': {
    separator: {
      marginLeft: '8px',
      marginRight: '8px'
    }
  }
}

export default style
