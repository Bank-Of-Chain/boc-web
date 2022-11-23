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

const AccountIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7.6" y="7.6" width="6.07273" height="6.07273" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
    <rect x="7.6" y="16.3266" width="6.07273" height="6.07273" rx="3.03636" stroke="currentColor" strokeWidth="1.2" />
    <rect x="16.3275" y="7.6" width="6.07273" height="6.07273" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
    <rect x="16.3275" y="16.3266" width="6.07273" height="6.07273" rx="1.4" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)
const CopyIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.6 10C9.6 9.2268 10.2268 8.6 11 8.6H21C21.7732 8.6 22.4 9.2268 22.4 10V22C22.4 22.7732 21.7732 23.4 21 23.4H11C10.2268 23.4 9.6 22.7732 9.6 22V10Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 8.6C7 7.16406 8.16406 6 9.6 6H18.6C20.0359 6 21.2 7.16406 21.2 8.6V9H20V8.6C20 7.8268 19.3732 7.2 18.6 7.2H9.6C8.8268 7.2 8.2 7.8268 8.2 8.6V19.6C8.2 20.3732 8.8268 21 9.6 21H10V22.2H9.6C8.16406 22.2 7 21.0359 7 19.6V8.6Z"
      fill="currentColor"
    />
  </svg>
)

const ChangeWalletIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.7226 15.7226C18.9289 15.5163 19.2087 15.4004 19.5004 15.4004C19.7921 15.4004 20.0719 15.5163 20.2782 15.7226C20.4845 15.9289 20.6004 16.2087 20.6004 16.5004C20.6004 16.7921 20.4845 17.0719 20.2782 17.2782C20.0719 17.4845 19.7921 17.6004 19.5004 17.6004C19.2087 17.6004 18.9289 17.4845 18.7226 17.2782C18.5163 17.0719 18.4004 16.7921 18.4004 16.5004C18.4004 16.2087 18.5163 15.9289 18.7226 15.7226Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5101 6.05435C19.1193 5.97624 18.7159 5.98898 18.3309 6.09158L7.33081 9.0246C6.77711 9.17218 6.28767 9.49853 5.93858 9.95295C5.58949 10.4073 5.40029 10.9645 5.40039 11.5375V12.0003C5.40039 12.0004 5.40039 12.0003 5.40039 12.0003V21.0004C5.40039 21.69 5.67432 22.3513 6.16191 22.8389C6.64951 23.3265 7.31083 23.6004 8.00039 23.6004H22.0004C22.69 23.6004 23.3513 23.3265 23.8389 22.8389C24.3265 22.3513 24.6004 21.69 24.6004 21.0004V12.0004C24.6004 11.3108 24.3265 10.6495 23.8389 10.1619C23.3513 9.67432 22.69 9.40039 22.0004 9.40039H21.6004V8.60318C21.6003 8.20474 21.5086 7.81165 21.3324 7.45427C21.1562 7.09689 20.9003 6.78478 20.5843 6.54205C20.2683 6.29932 19.9008 6.13246 19.5101 6.05435ZM20.4004 9.40039V8.60352C20.4003 8.38903 20.3509 8.17725 20.2561 7.98487C20.1612 7.79243 20.0234 7.62438 19.8533 7.49368C19.6831 7.36297 19.4852 7.27313 19.2748 7.23107C19.0645 7.18902 18.8473 7.19587 18.64 7.2511L10.5792 9.40039H20.4004ZM6.60039 12.0003C6.60039 12.0003 6.60039 12.0004 6.60039 12.0003V21.0004C6.60039 21.3717 6.74789 21.7278 7.01044 21.9903C7.27299 22.2529 7.62909 22.4004 8.00039 22.4004H22.0004C22.3717 22.4004 22.7278 22.2529 22.9903 21.9903C23.2529 21.7278 23.4004 21.3717 23.4004 21.0004V12.0004C23.4004 11.6291 23.2529 11.273 22.9903 11.0104C22.7278 10.7479 22.3717 10.6004 22.0004 10.6004H8.00039C7.62909 10.6004 7.27299 10.7479 7.01044 11.0104C6.7479 11.273 6.6004 11.6291 6.60039 12.0003Z"
      fill="currentColor"
    />
  </svg>
)
const ExitIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.4729 6.7269C19.3228 6.43144 18.9617 6.31355 18.6662 6.46359C18.3708 6.61363 18.2529 6.97477 18.4029 7.27023L22.0228 14.3986H11.0004C10.669 14.3986 10.4004 14.6672 10.4004 14.9986C10.4004 15.3299 10.669 15.5986 11.0004 15.5986H22.0228L18.4029 22.7269C18.2529 23.0224 18.3708 23.3835 18.6662 23.5335C18.9617 23.6836 19.3228 23.5657 19.4729 23.2702L23.5354 15.2702C23.6221 15.0995 23.6221 14.8976 23.5354 14.7269L19.4729 6.7269Z"
      fill="currentColor"
    />
    <path
      d="M7.60039 8.99857C7.60039 8.22537 8.22719 7.59857 9.00039 7.59857H15.0004C15.3318 7.59857 15.6004 7.32994 15.6004 6.99857C15.6004 6.6672 15.3318 6.39857 15.0004 6.39857H9.00039C7.56445 6.39857 6.40039 7.56263 6.40039 8.99857V20.9986C6.40039 22.4345 7.56445 23.5986 9.00039 23.5986H15.0004C15.3318 23.5986 15.6004 23.3299 15.6004 22.9986C15.6004 22.6672 15.3318 22.3986 15.0004 22.3986H9.00039C8.22719 22.3986 7.60039 21.7718 7.60039 20.9986V8.99857Z"
      fill="currentColor"
    />
  </svg>
)

export { MyAccountIcon, SwapIcon, WithdrawIcon, DepositIcon, SwitchIcon, AccountIcon, CopyIcon, ChangeWalletIcon, ExitIcon }
