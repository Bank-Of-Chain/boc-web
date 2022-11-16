import React from 'react'
import HoverIcon from '@/components/HoverIcon'

const SVG = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3084_281428)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM14.6547 13.4991V21H11.5507V13.4994H10V10.9146H11.5507V9.36264C11.5507 7.25393 12.4264 6 14.9142 6H16.9853V8.58514H15.6907C14.7223 8.58514 14.6582 8.94637 14.6582 9.62054L14.6547 10.9143H17L16.7256 13.4991H14.6547Z"
        fill="#F2F3F4"
      />
    </g>
    <defs>
      <clipPath id="clip0_3084_281428">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const SVG_HOVER = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3084_281430)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM14.6547 13.4991V21H11.5507V13.4994H10V10.9146H11.5507V9.36264C11.5507 7.25393 12.4264 6 14.9142 6H16.9853V8.58514H15.6907C14.7223 8.58514 14.6582 8.94637 14.6582 9.62054L14.6547 10.9143H17L16.7256 13.4991H14.6547Z"
        fill="url(#paint0_linear_3084_281430)"
      />
    </g>
    <defs>
      <linearGradient id="paint0_linear_3084_281430" x1="-3.26975e-07" y1="26" x2="30.5882" y2="18.3529" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FE3DCE" />
        <stop offset="1" stopColor="#94E3FF" />
      </linearGradient>
      <clipPath id="clip0_3084_281430">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const Facebook = props => {
  const { href } = props
  return <HoverIcon defaultIcon={SVG} hoverIcon={SVG_HOVER} href={href} />
}

export default Facebook
