import React from 'react'
import HoverIcon from '@/components/HoverIcon'

const SVG = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2384_259348)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM8.96163 7.78376C8.93993 6.80906 8.23552 6.06667 7.09166 6.06667C5.94781 6.06667 5.2 6.80906 5.2 7.78376C5.2 8.73827 5.92571 9.50204 7.04826 9.50204H7.06963C8.23552 9.50204 8.96163 8.73827 8.96163 7.78376ZM8.74138 10.8591H5.3977V20.8H8.74138V10.8591ZM20.8 15.0998C20.8 12.0464 19.1505 10.6252 16.9502 10.6252C15.1749 10.6252 14.3801 11.5901 13.9363 12.267V10.8589H10.5922C10.6363 11.7917 10.5922 20.7999 10.5922 20.7999H13.9363V15.248C13.9363 14.9509 13.958 14.6546 14.0464 14.4418C14.2881 13.8483 14.8383 13.2338 15.762 13.2338C16.9725 13.2338 17.4563 14.1453 17.4563 15.4812V20.7996H20.7999L20.8 15.0998Z"
        fill="#F2F3F4"
      />
    </g>
    <defs>
      <clipPath id="clip0_2384_259348">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const SVG_HOVER = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2735_256593)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0ZM8.96163 7.78376C8.93993 6.80906 8.23552 6.06667 7.09166 6.06667C5.94781 6.06667 5.2 6.80906 5.2 7.78376C5.2 8.73827 5.92571 9.50204 7.04826 9.50204H7.06963C8.23552 9.50204 8.96163 8.73827 8.96163 7.78376ZM8.74138 10.8591H5.3977V20.8H8.74138V10.8591ZM20.8 15.0998C20.8 12.0464 19.1505 10.6252 16.9502 10.6252C15.1749 10.6252 14.3801 11.5901 13.9363 12.267V10.8589H10.5922C10.6363 11.7917 10.5922 20.7999 10.5922 20.7999H13.9363V15.248C13.9363 14.9509 13.958 14.6546 14.0464 14.4418C14.2881 13.8483 14.8383 13.2338 15.762 13.2338C16.9725 13.2338 17.4563 14.1453 17.4563 15.4812V20.7996H20.7999L20.8 15.0998Z"
        fill="url(#paint0_linear_2735_256593)"
      />
    </g>
    <defs>
      <linearGradient id="paint0_linear_2735_256593" x1="-3.26975e-07" y1="26" x2="30.5882" y2="18.3529" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FE3DCE" />
        <stop offset="1" stopColor="#94E3FF" />
      </linearGradient>
      <clipPath id="clip0_2735_256593">
        <rect width="26" height="26" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const LinkedIn = props => {
  const { href } = props
  return <HoverIcon defaultIcon={SVG} hoverIcon={SVG_HOVER} href={href} />
}

export default LinkedIn
