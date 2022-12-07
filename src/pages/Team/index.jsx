import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import WebIcon from '@/components/HoverIcon/icons/Web'
import LinkedInIcon from '@/components/HoverIcon/icons/LinkedIn'
import GithubIcon from '@/components/HoverIcon/icons/Github'
import TwitterIcon from '@/components/HoverIcon/icons/Twitter'

// === Styles === //
import styles from './style'

const useStyles = makeStyles(styles)

const Founders = [
  {
    avatar: './images/avatar/DongliangLin.png',
    label: 'Co-Founder',
    name: 'Dongliang Lin',
    web: 'https://en.idgcapital.com/team/dongliang',
    linked: 'https://www.linkedin.com/in/dongliang-lin-a932b2131'
  },
  {
    avatar: './images/avatar/DejianLiu.png',
    label: 'Co-Founder',
    name: 'Dejian Liu',
    web: 'http://ir.nd.com.cn/en/staff/liu-dejian',
    linked: 'https://www.linkedin.cn/incareer/in/%E5%BE%B7%E5%BB%BA-%E5%88%98-4857a9156'
  },
  {
    avatar: './images/avatar/XiaotianZhang.png',
    label: 'Co-Founder',
    name: 'Xiaotian Zhang',
    linked: 'https://www.linkedin.com/in/xiaotian-zhang-2864655a/'
  }
]

const TeamMembers = [
  {
    avatar: './images/avatar/HongChen.png',
    label: 'Head of Technology',
    name: 'H'
  },
  {
    avatar: './images/avatar/BrainZhang.png',
    label: 'Head of Backend Engineering',
    name: 'Brain Zhang',
    github: 'https://github.com/ZhangBrian'
  },
  {
    avatar: './images/avatar/FerrisLee.png',
    label: 'Head of Frontend Engineering',
    name: 'Ferris Lee',
    github: 'https://github.com/jerrylib'
  },
  {
    avatar: './images/avatar/PabloGaspa.png',
    label: 'Head of Design',
    name: 'Pablo Gaspa',
    twitter: 'https://twitter.com/Gasparini_Pablo'
  },
  {
    avatar: './images/avatar/FranciscoRua.png',
    label: 'Head of Operations',
    name: 'Francisco Rua',
    github: 'https://github.com/Francisco-Rua',
    linked: 'https://www.linkedin.com/in/ruafrancisco/'
  },
  {
    avatar: './images/avatar/JiahuaXu.png',
    label: 'Head of Research',
    name: 'Jiahua Xu',
    twitter: 'https://twitter.com/JiahuaJavaXu',
    linked: 'https://www.linkedin.com/in/jiahuaxu/'
  },
  {
    avatar: './images/avatar/TaniaGeuna.png',
    label: 'Head of Public Relations ',
    name: 'Tania Geuna',
    twitter: 'https://twitter.com/TaniaGeuna',
    linked: 'https://www.linkedin.com/in/tania-geuna/'
  },
  {
    avatar: './images/avatar/SuFarn.png',
    label: 'Head of Community',
    name: 'Su Farn Fong',
    twitter: 'https://twitter.com/boc_Intern',
    linked: 'https://www.linkedin.com/in/su-farn-fong-a29489173/'
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
          const { avatar, label, name, web, linked } = item
          return (
            <li key={name} className={classes.member}>
              <div className={classes.avatar}>
                <img src={avatar} alt={name} />
              </div>
              <div className={classes.label}>{label}</div>
              <div className={classes.name}>{name}</div>
              <div className={classes.social}>
                {web && <WebIcon href={web} />}
                {linked && <LinkedInIcon href={linked} />}
              </div>
            </li>
          )
        })}
      </ul>
      <div className={classes.subTitle}>Core Team:</div>
      <ul className={classes.founders}>
        {TeamMembers.map(item => {
          const { avatar, label, name, web, linked, github, twitter } = item
          return (
            <li key={name} className={classes.member}>
              <div className={classes.avatar}>
                <img src={avatar} alt={name} />
              </div>
              <div className={classes.label}>{label}</div>
              <div className={classes.name}>{name}</div>
              <div className={classes.social}>
                {web && <WebIcon href={web} />}
                {github && <GithubIcon href={github} />}
                {twitter && <TwitterIcon href={twitter} />}
                {linked && <LinkedInIcon href={linked} />}
                {!web && !github && !twitter && !linked && <WebIcon />}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
