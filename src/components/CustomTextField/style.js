import { dangerColor } from '@/assets/jss/material-kit-react.js'

const style = {
  root: {
    width: '100%',
    margin: '12px 0 8px',
    '& .MuiInputBase-root': {
      color: '#fff'
    },
    '& .MuiOutlinedInput-input': {
      padding: '1rem',
      textAlign: 'right'
    },
    // border setting
    // '& .MuiOutlinedInput-notchedOutline': {
    //   borderWidth: '1px',
    //   borderColor: '#666'
    // },
    // '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    //   borderWidth: '1px',
    //   borderColor: '#666'
    // },
    // '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    //   borderWidth: '1px',
    //   borderColor: '#666'
    // },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: dangerColor
    }
  },
  inputRoot: {
    fontFamily: 'DM Sans',
    background: '#313036',
    borderRadius: '1.5625rem'
  },
  endAdornment: {
    color: '#A68EFE',
    cursor: 'pointer'
  },
  endAdornmentActive: {
    color: '#A68EFE',
    fontWeight: 'bold'
  }
}

export default style
