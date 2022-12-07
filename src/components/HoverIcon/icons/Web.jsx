import React from 'react'
import HoverIcon from '@/components/HoverIcon'

const SVG = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3085_283865)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM2.4668 16L1 11H2.28471L3.15468 14.5988L4.16626 11H5.60271L6.61429 14.5988L7.49437 11H8.77909L7.30217 16H5.95676L4.88448 12.2601L3.81221 16H2.4668ZM10.5773 16L9.11046 11H10.3952L11.2651 14.5988L12.2767 11H13.7132L14.7248 14.5988L15.6048 11H16.8895L15.4126 16H14.0672L12.9949 12.2601L11.9227 16H10.5773ZM17.2209 11L18.6877 16H20.0331L21.1054 12.2601L22.1777 16H23.5231L25 11H23.7153L22.8352 14.5988L21.8236 11H20.3872L19.3756 14.5988L18.5056 11H17.2209Z"
        fill="#F2F3F4"
      />
    </g>
    <defs>
      <clipPath id="clip0_3085_283865">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const SVG_HOVER = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3085_283869)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM2.4668 16L1 11H2.28471L3.15468 14.5988L4.16626 11H5.60271L6.61429 14.5988L7.49437 11H8.77909L7.30217 16H5.95676L4.88448 12.2601L3.81221 16H2.4668ZM10.5773 16L9.11046 11H10.3952L11.2651 14.5988L12.2767 11H13.7132L14.7248 14.5988L15.6048 11H16.8895L15.4126 16H14.0672L12.9949 12.2601L11.9227 16H10.5773ZM17.2209 11L18.6877 16H20.0331L21.1054 12.2601L22.1777 16H23.5231L25 11H23.7153L22.8352 14.5988L21.8236 11H20.3872L19.3756 14.5988L18.5056 11H17.2209Z"
        fill="url(#paint0_linear_3085_283869)"
      />
    </g>
    <defs>
      <linearGradient id="paint0_linear_3085_283869" x1="-3.26975e-07" y1="26" x2="30.5882" y2="18.3529" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FE3DCE" />
        <stop offset="1" stopColor="#94E3FF" />
      </linearGradient>
      <clipPath id="clip0_3085_283869">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const Web = props => {
  const { href } = props
  return <HoverIcon style={!href ? { visibility: 'hidden' } : {}} defaultIcon={SVG} hoverIcon={SVG_HOVER} href={href} />
}

export default Web
