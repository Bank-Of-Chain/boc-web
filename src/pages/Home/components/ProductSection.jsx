import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

// === Components === //
import InfoArea from '@/components/InfoArea/InfoArea'

// === Utils === //
import map from 'lodash/map'
import useMediaQuery from '@material-ui/core/useMediaQuery'

// === Styles === //
import styles from './productStyle'

import { Navigation, Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import 'swiper/swiper-bundle.min.css'

const useStyles = makeStyles(styles)

const data = [
  {
    title: 'Full automation',
    descriptions: ['Regular yield calibration for the best rates, adjusting for FX and the costs and rewards of reallocation.'],
    imagePath: require('./../images/point-6.png')
  },
  {
    title: 'Ease of use',
    descriptions: ['Flexible deposit/withdrawal. No complex operations. Visible yields. Automatic reinvestment.'],
    imagePath: require('./../images/point-3.png')
  },
  {
    title: 'Safe',
    descriptions: ['Only Chainlink oracles. Only official cross-chain bridges. Only billion-dollar stablecoins and blockchains.'],
    imagePath: require('./../images/point-1.png')
  },
  {
    title: 'Risk control',
    descriptions: ['The incorporation of protocols and stablecoins with minimal risk of depegging and suffering from impermanent loss.'],
    imagePath: require('./../images/point-5.png')
  },
  {
    title: 'Diversification',
    descriptions: ['Investments in a single capital pool or a protocol will be strictly capped, minimizing third-party risks.'],
    imagePath: require('./../images/point-4.png')
  }
]

export default function ProductSection() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  return (
    <div className={classes.section}>
      <h1 className={classes.text}>BoC is different.</h1>
      <div className={classes.swiper}>
        <Swiper
          loop={true}
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={isLayoutSm ? 2 : 3}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }}
          autoplay={false}
        >
          {map(data, (item, i) => {
            const { title, descriptions = [], imagePath } = item
            return (
              <SwiperSlide key={i}>
                <InfoArea
                  title={title}
                  description={map(descriptions, (d, index) => (
                    <span key={`item-${index}`} style={{ display: 'inline-block' }}>
                      {descriptions.length > 1 ? `${index + 1}. ` : ''}
                      {d}
                    </span>
                  ))}
                  icon={<img src={imagePath} alt="" />}
                  vertical
                  style={{
                    height: '25rem',
                    padding: isLayoutSm ? '2rem' : '6rem 3rem 3rem'
                  }}
                />
              </SwiperSlide>
            )
          })}
        </Swiper>
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
      </div>
    </div>
  )
}
