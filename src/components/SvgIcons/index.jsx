import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

const MyAccountIcon = ({ color = '#fff' }) => (
  <SvgIcon viewBox="0 0 30 30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 19.5L12.5 12.5L17.5 17.5L24.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="4" cy="21" rx="2" ry="2" transform="rotate(-180 4 21)" stroke={color} strokeWidth="1.5" />
      <ellipse cx="26" cy="9" rx="2" ry="2" transform="rotate(-180 26 9)" stroke={color} strokeWidth="1.5" />
    </svg>
  </SvgIcon>
)

const DepositIcon = ({ color = '#fff' }) => (
  <SvgIcon viewBox="0 0 30 30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 21V22.5C3 25.5 4.71429 27 8.14286 27C16.846 27 21.8571 27 21.8571 27C25.2857 27 27 25.5 27 22.5V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="15" cy="5" rx="2" ry="2" transform="rotate(-180 15 5)" stroke={color} strokeWidth="1.5" />
      <path d="M15 21L10 16.2581M15 21L20 16.2581M15 21L15 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </SvgIcon>
)

const WithdrawIcon = ({ color = '#fff' }) => (
  <SvgIcon viewBox="0 0 30 30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 21V22.5C3 25.5 4.71429 27 8.14286 27C16.846 27 21.8571 27 21.8571 27C25.2857 27 27 25.5 27 22.5V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="19" r="2" stroke={color} strokeWidth="1.5" />
      <path d="M15 3L20 7.74194M15 3L10 7.74194M15 3L15 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </SvgIcon>
)

const SwapIcon = ({ color = '#fff' }) => (
  <SvgIcon viewBox="0 0 30 30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="7" cy="6" rx="3" ry="3" transform="rotate(-180 7 6)" stroke={color} strokeWidth="1.5" />
      <path
        d="M10 6C10 6 12.607 6 19 6C21.5185 6 23 7.42238 23 10L23 15M23 15L18.5 10.5M23 15L27.5 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="23" cy="24" rx="3" ry="3" stroke={color} strokeWidth="1.5" />
      <path
        d="M20 24C20 24 17.393 24 11 24C8.48148 24 7 22.5776 7 20L7 15M7 15L11.5 19.5M7 15L2.5 19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </SvgIcon>
)

const SwitchIcon = ({ color = '#fff' }) => (
  <SvgIcon viewBox="0 0 30 30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="23" rx="3" ry="3" transform="rotate(-90 24 23)" stroke={color} strokeWidth="1.5" />
      <path d="M3 23L7.5 18.5M3 23L7.49998 27.5M3 23L21 23" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="6" cy="7" rx="3" ry="3" transform="rotate(90 6 7)" stroke={color} strokeWidth="1.5" />
      <path d="M27 7L22.5 11.5M27 7L22.5 2.5M27 7L9.00001 6.99999" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </SvgIcon>
)

export { MyAccountIcon, SwapIcon, WithdrawIcon, DepositIcon, SwitchIcon }
