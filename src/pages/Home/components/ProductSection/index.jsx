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
    descriptions: [
      'Regular yield calibration for the best capita allocation, costs/rewards justification of position adjustments, deleverage for price fluctuation.'
    ],
    imagePath: (
      <svg viewBox="0 0 122 119" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1805_2170)">
          <path
            d="M53.0714 87.2857C42.5286 87.2857 32.2786 82.0143 26.1286 72.6429H41.3571V66.7857H17.9286V90.2143H23.7857V79.3786C31.1071 88.1643 41.65 93.1429 53.0714 93.1429V87.2857ZM97 75.5714V69.7143H90.85C90.5571 67.9571 89.6786 66.2 88.8 64.4429L93.1929 60.05L89.0929 55.95L84.7 60.3429C83.2357 59.4643 81.4786 58.5857 79.4286 58.2929V52.1429H73.5714V58.2929C71.8143 58.5857 70.0571 59.4643 68.3 60.3429L63.9071 55.95L59.8071 60.05L64.2 64.4429C63.3214 65.9071 62.4429 67.6643 62.15 69.7143H56V75.5714H62.15C62.4429 77.3286 63.3214 79.0857 64.2 80.8428L59.8071 85.2357L63.9071 89.3357L68.3 84.9429C69.7643 85.8214 71.5214 86.7 73.5714 86.9929V93.1429H79.4286V86.9929C81.1857 86.7 82.9429 85.8214 84.7 84.9429L89.0929 89.3357L93.1929 85.2357L88.8 80.8428C89.6786 79.3786 90.5571 77.6214 90.85 75.5714H97ZM76.5 81.4286C71.5214 81.4286 67.7143 77.6214 67.7143 72.6429C67.7143 67.6643 71.5214 63.8571 76.5 63.8571C81.4786 63.8571 85.2857 67.6643 85.2857 72.6429C85.2857 77.6214 81.4786 81.4286 76.5 81.4286ZM64.7857 37.5H80.0143C70.35 22.5643 50.4357 18.4643 35.5 28.1286C26.4214 33.9857 20.8571 44.2357 20.8571 55.0714H15C15 33.9857 31.9857 17 53.0714 17C64.4929 17 75.0357 21.9786 82.3571 30.7643V19.9286H88.2143V43.3571H64.7857V37.5Z"
            fill="#A68EFE"
          />
        </g>
        <defs>
          <filter id="filter0_d_1805_2170" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="5" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0.996078 0 0 0 0 0.239216 0 0 0 0 0.807843 0 0 0 0.5 0" />
            <feBlend in2="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_1805_2170" />
          </filter>
        </defs>
      </svg>
    )
  },
  {
    title: 'Ease of use',
    descriptions: ['Flexible deposit/withdrawal. No complex operations. Visible yields. Automatic reinvestment.'],
    imagePath: (
      <svg width="102" height="121" viewBox="0 0 102 121" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1805_2180)">
          <path
            d="M76.4595 53.9118C72.3925 49.6189 66.9699 46.6816 61.3213 45.5519C58.8359 44.8741 56.3506 44.4222 53.8652 44.1962C60.1916 36.7401 59.0619 25.443 51.6058 19.1166C44.1496 12.7902 32.8525 13.9199 26.5261 21.376C20.1997 28.8321 21.3294 40.1293 28.7855 46.4557C30.1412 47.5854 31.4969 48.4892 32.8525 48.941V53.9118L29.2374 50.5226C26.0742 47.3594 20.8775 47.3594 17.4884 50.5226C14.3252 53.6858 14.0993 58.6566 17.2625 61.8198L27.6558 74.0207C28.1077 77.1839 29.2374 80.1211 30.819 82.8325C31.9487 84.8659 33.5303 86.8994 35.1119 88.481V92.7739C35.1119 94.1296 36.0157 95.0334 37.3714 95.0334H68.0996C69.2293 95.0334 70.359 93.9037 70.359 92.7739V86.8994C74.6519 81.7028 76.9114 75.1504 76.9114 68.5981V55.4934C77.1373 54.5896 76.9114 54.1377 76.4595 53.9118V53.9118ZM26.752 32.6732C26.752 25.2171 32.8525 19.3425 40.3086 19.5685C47.7647 19.5685 53.6392 25.6689 53.4133 33.125C53.4133 37.192 51.6058 40.8071 48.4426 43.2925V31.9953C48.3272 30.0373 47.4672 28.1975 46.0388 26.8531C44.6105 25.5088 42.722 24.7618 40.7605 24.7652C36.6935 24.5392 33.0784 27.9284 33.0784 31.9953V43.7444C29.2374 41.4849 26.978 37.192 26.752 32.6732ZM72.6184 68.3721C72.8444 74.2466 70.8109 79.8952 66.9699 84.4141C66.518 84.8659 66.0661 85.3178 66.0661 85.9957V90.7405H39.8567V87.5773C39.8567 86.8994 39.4048 86.2216 38.953 85.7697C37.3714 84.4141 36.0157 82.8325 34.886 80.799C33.5303 78.5396 32.6266 75.8282 32.1747 73.1169C32.1747 72.665 31.9487 72.2132 31.7228 71.7613L20.8775 58.8825C20.1997 58.2047 19.7478 57.3009 19.7478 56.1712C19.7478 55.2674 20.1997 54.1377 20.8775 53.4599C22.4591 52.1042 24.7186 52.1042 26.3002 53.4599L32.8525 60.0122V66.7905L37.1454 64.5311V31.9953C37.3714 30.4137 38.727 29.0581 40.5346 29.284C42.1162 29.284 43.6978 30.4137 43.6978 31.9953V57.9788L48.2166 58.8825V48.4892C48.4426 48.2632 48.6685 48.2632 48.8944 48.0373C50.476 48.0373 52.0576 48.2632 53.6392 48.4892V60.0122L57.2543 60.6901V48.941L59.9656 49.6189C61.0954 49.8448 62.2251 50.2967 63.3548 50.7486V62.0457L66.9699 62.7236V52.3302C69.0034 53.234 70.8109 54.5896 72.3925 56.1712L72.6184 68.3721V68.3721Z"
            fill="#A68EFE"
          />
        </g>
        <defs>
          <filter id="filter0_d_1805_2180" x="0" y="0" width="102" height="120.033" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="5" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.239216 0 0 0 0 0.807843 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1805_2180" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1805_2180" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  },
  {
    title: 'Safe',
    descriptions: [
      'Only Chainlink oracles. Only official cross-chain bridges between Ethereum and Layer2s. Only billion-dollar fully collateral stablecoins. Only fully audited protocols with high TVL and good track records'
    ],
    imagePath: (
      <svg width="109" height="116" viewBox="0 0 109 116" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1805_2188)">
          <path
            d="M34.7307 50.5003C35.4555 50.4333 36.1785 50.6423 36.7554 51.085L37.0737 51.3661L44.6345 58.9268L63.2225 40.3388C63.7423 39.8213 64.4394 39.5209 65.1726 39.4985C65.9062 39.4761 66.6209 39.7338 67.1714 40.2192C67.7219 40.7046 68.067 41.3814 68.1367 42.1121C68.2053 42.8327 68.0009 43.5525 67.5645 44.1292L67.2854 44.4453L46.9529 64.7816C46.3848 65.3496 45.6279 65.6892 44.8259 65.7359C44.0326 65.7821 43.2498 65.5385 42.623 65.0509L42.2946 64.7601L32.9672 55.4327L32.9638 55.4294C32.4402 54.9107 32.1346 54.2115 32.1096 53.4749C32.0846 52.7383 32.3421 52.02 32.8293 51.467C33.3166 50.9141 33.9968 50.5682 34.7307 50.5003Z"
            fill="#A68EFE"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M51.567 15.5554L78.7661 25.7551C79.9689 26.2061 81.0188 26.9897 81.7934 28.0144C82.5642 29.0341 83.0308 30.2508 83.1396 31.5241L83.165 32.1238V52.9587C83.1649 59.0803 81.512 65.0883 78.3809 70.3485C75.2511 75.6065 70.7604 79.9223 65.3824 82.8409L64.3624 83.3739L51.3278 89.8913C50.7327 90.1884 50.0827 90.3595 49.4185 90.3939C48.7617 90.4278 48.105 90.3274 47.4885 90.0989L46.9772 89.8787L33.9595 83.3699C28.484 80.6321 23.8493 76.4667 20.5446 71.3135C17.2414 66.1626 15.3895 60.2158 15.1842 54.1003L15.165 52.9504V32.1026C15.1651 30.8187 15.5298 29.5612 16.2167 28.4764C16.9002 27.3971 17.8748 26.5331 19.0279 25.9838L19.5841 25.7475L46.7862 15.5467C48.1172 15.0488 49.5708 14.9821 50.9416 15.3554L51.567 15.5554ZM77.3873 31.4096L49.165 20.8263L20.9428 31.4096V52.9587C20.9429 58.0186 22.3033 62.9854 24.8817 67.3391C27.46 71.6928 31.1613 75.2733 35.5982 77.7056L35.6067 77.7102L36.5373 78.1973L49.165 84.5112L61.7845 78.2015C66.311 75.9387 70.1458 72.5003 72.8873 68.2466C75.6288 63.9928 77.1761 59.0802 77.3671 54.0231L77.3675 54.0137L77.3873 52.9682V31.4096Z"
            fill="#A68EFE"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1805_2188"
            x="0.165039"
            y="0.117188"
            width="108"
            height="115.283"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="5" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.239216 0 0 0 0 0.807843 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1805_2188" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1805_2188" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  },
  {
    title: 'Risk control',
    descriptions: ['Protocols and stablecoins with minimal risk of de-pegging and impermanent loss.'],
    imagePath: (
      <svg width="116" height="121" viewBox="0 0 116 121" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1805_2196)">
          <path
            d="M56.2749 80.5H80.6699C81.996 80.5 83.2678 79.9732 84.2054 79.0355C85.1431 78.0979 85.6699 76.8261 85.6699 75.5V25.5C85.6699 24.1739 85.1431 22.9021 84.2054 21.9645C83.2678 21.0268 81.996 20.5 80.6699 20.5H30.6649C29.3388 20.5 28.067 21.0268 27.1294 21.9645C26.1917 22.9021 25.6649 24.1739 25.6649 25.5V46.785C23.9006 47.4089 22.2209 48.2504 20.6649 49.29V25.5C20.6649 22.8478 21.7185 20.3043 23.5938 18.4289C25.4692 16.5536 28.0127 15.5 30.6649 15.5H80.6649C83.3171 15.5 85.8606 16.5536 87.736 18.4289C89.6113 20.3043 90.6649 22.8478 90.6649 25.5V75.5C90.6649 78.1522 89.6113 80.6957 87.736 82.5711C85.8606 84.4464 83.3171 85.5 80.6649 85.5H61.2699L56.2699 80.5H56.2749ZM39.4199 40.5C40.4145 40.5 41.3683 40.1049 42.0716 39.4017C42.7748 38.6984 43.1699 37.7446 43.1699 36.75C43.1699 35.7554 42.7748 34.8016 42.0716 34.0983C41.3683 33.3951 40.4145 33 39.4199 33C38.4253 33 37.4715 33.3951 36.7682 34.0983C36.065 34.8016 35.6699 35.7554 35.6699 36.75C35.6699 37.7446 36.065 38.6984 36.7682 39.4017C37.4715 40.1049 38.4253 40.5 39.4199 40.5ZM50.6649 38C50.6649 37.337 50.9283 36.7011 51.3971 36.2322C51.866 35.7634 52.5019 35.5 53.1649 35.5H73.1649C73.8279 35.5 74.4638 35.7634 74.9327 36.2322C75.4015 36.7011 75.6649 37.337 75.6649 38C75.6649 38.663 75.4015 39.2989 74.9327 39.7678C74.4638 40.2366 73.8279 40.5 73.1649 40.5H53.1649C52.5019 40.5 51.866 40.2366 51.3971 39.7678C50.9283 39.2989 50.6649 38.663 50.6649 38ZM50.6649 53C50.6649 52.337 50.9283 51.7011 51.3971 51.2322C51.866 50.7634 52.5019 50.5 53.1649 50.5H73.1649C73.8279 50.5 74.4638 50.7634 74.9327 51.2322C75.4015 51.7011 75.6649 52.337 75.6649 53C75.6649 53.663 75.4015 54.2989 74.9327 54.7678C74.4638 55.2366 73.8279 55.5 73.1649 55.5H53.1649C52.5019 55.5 51.866 55.2366 51.3971 54.7678C50.9283 54.2989 50.6649 53.663 50.6649 53ZM73.1649 70.5H55.5249C55.7106 68.8385 55.7106 67.1615 55.5249 65.5H73.1699C73.8329 65.5 74.4688 65.7634 74.9377 66.2322C75.4065 66.7011 75.6699 67.337 75.6699 68C75.6699 68.663 75.4065 69.2989 74.9377 69.7678C74.4688 70.2366 73.8329 70.5 73.1699 70.5H73.1649ZM17.5899 60.025C15.7878 63.5465 15.2319 67.5748 16.013 71.4527C16.7941 75.3307 18.8661 78.8297 21.891 81.3789C24.9159 83.9282 28.7153 85.3774 32.6695 85.4902C36.6238 85.603 40.4996 84.3727 43.6649 82L56.3799 94.79C56.8493 95.2588 57.4858 95.5219 58.1492 95.5214C58.8126 95.5209 59.4486 95.2569 59.9174 94.7875C60.3862 94.3181 60.6493 93.6816 60.6488 93.0182C60.6483 92.3548 60.3843 91.7188 59.9149 91.25L47.1649 78.5C48.6167 76.5608 49.6501 74.3414 50.1997 71.9821C50.7493 69.6229 50.8031 67.1752 50.3577 64.7941C49.9123 62.413 48.9774 60.1502 47.6122 58.1492C46.2469 56.1481 44.4811 54.4523 42.4265 53.169C40.3719 51.8857 38.0733 51.043 35.6761 50.6942C33.2789 50.3454 30.8355 50.498 28.5003 51.1425C26.1652 51.7869 23.9893 52.9092 22.1104 54.4382C20.2315 55.9672 18.6905 57.8696 17.5849 60.025H17.5899ZM43.5599 61.055C44.4897 62.4194 45.14 63.9544 45.4733 65.5715C45.8065 67.1887 45.8161 68.8558 45.5015 70.4766C45.1868 72.0974 44.5542 73.6399 43.6401 75.0148C42.726 76.3898 41.5486 77.57 40.1758 78.4874C38.8031 79.4048 37.2622 80.0411 35.6421 80.3597C34.022 80.6782 32.3549 80.6726 30.737 80.3433C29.1191 80.0139 27.5825 79.3673 26.2159 78.4407C24.8493 77.5142 23.6798 76.3261 22.7749 74.945C20.9688 72.1885 20.3244 68.8302 20.9818 65.6009C21.6392 62.3717 23.5453 59.5326 26.2853 57.7016C29.0253 55.8705 32.3775 55.1956 35.6126 55.8236C38.8478 56.4516 41.704 58.3318 43.5599 61.055Z"
            fill="#A68EFE"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1805_2196"
            x="0.668457"
            y="0.5"
            width="114.997"
            height="120.021"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="5" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.239216 0 0 0 0 0.807843 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1805_2196" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1805_2196" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  },
  {
    title: 'Diversification',
    descriptions: ['Investments in a single pool or protocol will be strictly capped, minimizing third-party risks.'],
    imagePath: (
      <svg width="125" height="122" viewBox="0 0 125 122" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1805_2203)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M57.7869 22.4514H90.6865V16.0002L99.8552 25.169L90.6865 34.3377V27.8865H56.0523V41.243H50.6172V29.6211C50.6172 27.7196 51.3725 25.896 52.7171 24.5514C54.0617 23.2068 55.8853 22.4514 57.7869 22.4514ZM68.4257 53.6165H90.6865V47.1653L99.8552 56.334L90.6865 65.5027V59.0515H68.4257V53.6165ZM90.6865 96.6678V90.2166H57.7869C55.8853 90.2166 54.0617 89.4612 52.7171 88.1166C51.3725 86.772 50.6172 84.9484 50.6172 83.0469V71.425H56.0523V84.7815H90.6865V78.3303L99.8552 87.499L90.6865 96.6678ZM46.2985 56.3493C46.3344 52.2922 49.5408 49.1768 53.5332 49.1643C57.4023 49.2845 60.5044 52.4393 60.5044 56.334C60.5044 60.3179 57.3186 63.5037 53.3347 63.5037C49.3983 63.5037 46.2626 60.4133 46.2985 56.3493ZM38.2437 53.6165V59.0515H15V53.6165H38.2437Z"
            fill="#A68EFE"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1805_2203"
            x="0"
            y="1.00024"
            width="124.855"
            height="120.667"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="5" dy="5" />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix values="0 0 0 0 0.996078 0 0 0 0 0.239216 0 0 0 0 0.807843 0 0 0 0.5 0" />
            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1805_2203" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_1805_2203" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  }
]

export default function ProductSection() {
  const classes = useStyles()
  const isLayoutSm = useMediaQuery('(max-width: 960px)')
  return (
    <div className={classes.section}>
      <h1 className={classes.text}>BoC is different</h1>
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
          autoplay={true}
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
                  icon={imagePath}
                  vertical
                  style={{
                    height: '28rem',
                    padding: isLayoutSm ? '2rem' : '5.25rem 1.5rem 1.5rem'
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
