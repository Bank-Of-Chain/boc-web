import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const WWW_SVG = (
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

const IN_SVG = (
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

const Founders = [
  {
    avatar: './images/avatar/DongliangLin.png',
    label: 'Co-Founder',
    name: 'Dongliang Lin'
  },
  // {
  //   avatar: './images/avatar/DejianLiu.png',
  //   label: 'Co-Founder',
  //   name: 'Dejian Liu '
  // },
  {
    avatar: './images/avatar/XiaotianZhang.png',
    label: 'Co-Founder',
    name: 'Xiaotian Zhang '
  }
]

const TeamMembers = [
  // {
  //   avatar: './images/avatar/HongChen.png',
  //   label: 'Head of Technology',
  //   name: 'Hong Chen'
  // },
  // {
  //   avatar: './images/avatar/BrainZhang.png',
  //   label: 'Head of Backend Engineering',
  //   name: 'Brain Zhang'
  // },
  // {
  //   avatar: './images/avatar/FerrisLee.png',
  //   label: 'Head of Frontend Engineering',
  //   name: 'Ferris Lee'
  // },
  {
    avatar: './images/avatar/PabloGaspa.png',
    label: 'Head of Design',
    name: 'Pablo Gaspa'
  },
  {
    avatar: './images/avatar/FranciscoRua.png',
    label: 'Head of Operations',
    name: 'Francisco Rua'
  },
  {
    avatar: './images/avatar/JiahuaXu.png',
    label: 'Head of Research',
    name: 'Jiahua Xu'
  },
  {
    avatar: './images/avatar/TaniaGeuna.png',
    label: 'Head of Public Relations ',
    name: 'Tania Geuna'
  },
  {
    avatar: './images/avatar/SuFarn.png',
    label: 'Head of Community',
    name: 'Su Farn Fong'
  }
]

export default function Home() {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Meet our team</h1>
      <p className={classes.description}>
        We are a team of investors, builders, creators and thinkers. Passionate about transforming financial systems, we bring banking and technology
        expertise, we focus and execute.
      </p>
      <div className={classes.subTitle}>Founders:</div>
      <ul className={classes.founders}>
        {Founders.map(item => {
          const { avatar, label, name } = item
          return (
            <li key={name} className={classes.member}>
              <div className={classes.avatar}>
                <img src={avatar} alt={name} />
              </div>
              <div className={classes.label}>{label}</div>
              <div className={classes.name}>{name}</div>
              <div className={classes.social}>
                {WWW_SVG}
                {IN_SVG}
              </div>
            </li>
          )
        })}
      </ul>
      <div className={classes.subTitle}>Core Team:</div>
      <ul className={classes.founders}>
        {TeamMembers.map(item => {
          const { avatar, label, name } = item
          return (
            <li key={name} className={classes.member}>
              <div className={classes.avatar}>
                <img src={avatar} alt={name} />
              </div>
              <div className={classes.label}>{label}</div>
              <div className={classes.name}>{name}</div>
              <div className={classes.social}>
                {WWW_SVG}
                {IN_SVG}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
