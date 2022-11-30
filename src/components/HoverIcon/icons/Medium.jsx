import React from 'react'
import HoverIcon from '@/components/HoverIcon'

const SVG = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2384_259358)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM16.985 6H22V6.42951L20.3252 7.7985L20.3482 18.1094L22 19.6081V20H14.7948V19.673L16.49 18.1392V10.0291L12.3552 20H11.7937L7.1381 10.2601L7.07979 17.1595L9.28758 19.6289L9.27402 20H4.00407L4 19.5964L5.86604 17.1595L5.89181 8.63416L4.00407 6.42692V6H9.36216L13.417 14.5915L16.985 6Z"
        fill="#F2F3F4"
      />
    </g>
    <defs>
      <clipPath id="clip0_2384_259358">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const SVG_HOVER = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2735_256602)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM16.985 6H22V6.42951L20.3252 7.7985L20.3482 18.1094L22 19.6081V20H14.7948V19.673L16.49 18.1392V10.0291L12.3552 20H11.7937L7.1381 10.2601L7.07979 17.1595L9.28758 19.6289L9.27402 20H4.00407L4 19.5964L5.86604 17.1595L5.89181 8.63416L4.00407 6.42692V6H9.36216L13.417 14.5915L16.985 6Z"
        fill="url(#paint0_linear_2735_256602)"
      />
    </g>
    <defs>
      <linearGradient id="paint0_linear_2735_256602" x1="-3.26975e-07" y1="26" x2="30.5882" y2="18.3529" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FE3DCE" />
        <stop offset="1" stopColor="#94E3FF" />
      </linearGradient>
      <clipPath id="clip0_2735_256602">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const Medium = props => {
  const { href } = props
  return <HoverIcon defaultIcon={SVG} hoverIcon={SVG_HOVER} href={href} />
}

export default Medium
