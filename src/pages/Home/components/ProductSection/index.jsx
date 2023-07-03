import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import InfoArea from '@/components/InfoArea/InfoArea'
import { FullAutoIcon, EaseUseIcon, SafeIcon, RiskControlIcon, DiverseIcon } from '@/components/SvgIcons'

// === Utils === //
import map from 'lodash-es/map'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Styles === //
import styles from './productStyle'

import { Navigation, Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.min.css'

const useStyles = makeStyles(styles)

export default function ProductSection() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  const iconSize = !isLayoutSm ? 80 : 60
  const data = [
    {
      title: 'Full Automation',
      description:
        'Regular yield calibration for the best capita allocation, costs/rewards justification of position adjustments, deleverage for price fluctuation.',
      imagePath: <FullAutoIcon style={{ fontSize: iconSize }} />
    },
    {
      title: 'Ease of Use',
      description: 'Flexible deposit/withdrawal. No complex operations. Visible yields. Automatic reinvestment.',
      imagePath: <EaseUseIcon style={{ fontSize: iconSize }} />
    },
    {
      title: 'Safe',
      description:
        'Only Chainlink oracles. Only official cross-chain bridges between Ethereum and Layer2s. Only billion-dollar fully collateral stablecoins. Only fully audited protocols with high TVL and good track records',
      imagePath: <SafeIcon style={{ fontSize: iconSize }} />
    },
    {
      title: 'Risk Control',
      description: 'Protocols and stablecoins with minimal risk of de-pegging and impermanent loss.',
      imagePath: <RiskControlIcon style={{ fontSize: iconSize }} />
    },
    {
      title: 'Diversification',
      description: 'Investments in a single pool or protocol will be strictly capped, minimizing third-party risks.',
      imagePath: <DiverseIcon style={{ fontSize: iconSize }} />
    }
  ]

  const renderContent = () => {
    if (isLayoutSm) {
      return map(data, (item, i) => {
        const { title, description, imagePath } = item
        return (
          <div key={i} className={classes.item}>
            <div className={classes.img}>{imagePath}</div>
            <div className={classes.info}>
              <div className={classes.title}>{title}</div>
              <div className={classes.description}>{description}</div>
            </div>
          </div>
        )
      })
    }
    return (
      <>
        <Swiper
          loop={true}
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={3}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }}
          autoplay={true}
        >
          {map(data, (item, i) => {
            const { title, description, imagePath } = item
            return (
              <SwiperSlide key={i}>
                <InfoArea title={title} description={description} icon={imagePath} />
              </SwiperSlide>
            )
          })}
        </Swiper>
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
      </>
    )
  }

  return (
    <div className={classes.section}>
      <h1 className={classes.text}>BoC is different</h1>
      <div className={classes.swiper}>{renderContent()}</div>
    </div>
  )
}
