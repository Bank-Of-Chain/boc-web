import { withStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider'

const PrettoSlider = withStyles({
  root: {
    color: '#A68EFE',
    height: 8
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit'
    }
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)'
  },
  track: {
    height: 8,
    borderRadius: 4
  },
  mark: {
    height: 8,
    width: 1
  },
  markLabel: {
    color: '#A68EFE'
  },
  rail: {
    height: 8,
    borderRadius: 4
  }
})(Slider)

export default PrettoSlider
