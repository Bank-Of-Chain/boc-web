import React from 'react'
import classNames from 'classnames'
import { List, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

// === Services === //
import { isProEnv } from '@/services/env-service'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import IconButton from '@material-ui/core/IconButton'
import SvgIcon from '@material-ui/core/SvgIcon'
import Divider from '@material-ui/core/Divider'

// === Constants === //
import {
  COMMUNITY_URL,
  DOCUMENT_URL,
  TELEGRAM_URL,
  TWITTER_URL,
  LINKEDIN_URL,
  YOUTUBE_URL,
  MEDIUM_URL,
  ENV,
  PUBLISH_BRANCH,
  PUBLISH_TIME
} from '@/constants'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import styles from './footerStyle.js'

const useStyles = makeStyles(styles)

const ICON1 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_2720_30680)">
          <path
            d="M21.6828 2.9711C21.4747 2.79479 21.2227 2.67814 20.9537 2.63357C20.6846 2.589 20.4085 2.61817 20.1547 2.71798L2.84842 9.51486C2.54487 9.63051 2.28775 9.84273 2.11666 10.1189C1.94556 10.395 1.86998 10.7197 1.90154 11.043C1.9297 11.3662 2.06187 11.6715 2.27822 11.9132C2.49458 12.1549 2.78346 12.32 3.10154 12.3836L7.49842 13.2555V18.7492C7.49826 19.0464 7.58639 19.337 7.75164 19.584C7.91688 19.8311 8.15178 20.0234 8.42654 20.1367C8.60838 20.2099 8.80241 20.2481 8.99842 20.2492C9.19543 20.2499 9.39059 20.2113 9.5725 20.1357C9.7544 20.06 9.91938 19.9488 10.0578 19.8086L12.4953 17.3805L16.1797 20.6242C16.4517 20.8641 16.8014 20.9974 17.164 20.9992C17.3235 21.0025 17.4823 20.9771 17.6328 20.9242C17.8802 20.846 18.1029 20.7045 18.2788 20.5137C18.4547 20.323 18.5778 20.0896 18.6359 19.8367L22.1609 4.44298C22.2225 4.17735 22.2106 3.89996 22.1263 3.64062C22.0421 3.38128 21.8887 3.14981 21.6828 2.9711ZM17.1734 19.4992L9.44842 12.7024L20.5765 4.66798L17.1734 19.4992Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_2720_30680">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON2 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_2720_30683)">
          <path
            d="M23.1851 15.9193L19.9976 5.30681C19.9364 5.09217 19.8268 4.8944 19.6773 4.72865C19.5278 4.5629 19.3423 4.43357 19.1351 4.35056H19.0789L19.1351 4.33181C18.0892 3.91274 17.0064 3.59259 15.9008 3.37556C15.8041 3.35646 15.7046 3.35659 15.6081 3.37593C15.5115 3.39528 15.4196 3.43346 15.3378 3.48831C15.2559 3.54316 15.1857 3.61359 15.1311 3.69559C15.0765 3.77758 15.0386 3.86953 15.0195 3.96619C14.999 4.06227 14.9978 4.16148 15.016 4.25802C15.0342 4.35457 15.0715 4.44653 15.1256 4.52855C15.1797 4.61056 15.2495 4.68099 15.3311 4.73574C15.4127 4.79049 15.5044 4.82846 15.6008 4.84744C16.0226 4.93181 16.4351 5.03494 16.8383 5.14744C16.9867 5.22451 17.1052 5.34901 17.1748 5.50114C17.2444 5.65328 17.2611 5.82431 17.2223 5.98704C17.1835 6.14977 17.0914 6.29486 16.9607 6.39923C16.8299 6.50361 16.668 6.56127 16.5008 6.56306H16.4258C14.981 6.18629 13.4938 5.99723 12.0008 6.00056C10.5428 5.99622 9.09032 6.17896 7.67889 6.54431C7.49928 6.5917 7.30848 6.57076 7.14344 6.48553C6.97839 6.40031 6.85084 6.25687 6.78549 6.08299C6.72014 5.90911 6.72164 5.71717 6.7897 5.54434C6.85776 5.3715 6.98753 5.23007 7.15389 5.14744H7.16326C7.56639 5.03494 7.97889 4.93181 8.40076 4.84744C8.49741 4.82837 8.58937 4.79045 8.67136 4.73584C8.75336 4.68123 8.82379 4.61101 8.87864 4.52917C8.93348 4.44733 8.97167 4.35549 8.99102 4.25889C9.01036 4.1623 9.01049 4.06283 8.99139 3.96619C8.95064 3.7722 8.83566 3.60183 8.671 3.49147C8.50634 3.38112 8.30505 3.33952 8.11014 3.37556C7.00054 3.59745 5.91444 3.92391 4.86639 4.35056C4.65918 4.43357 4.47372 4.5629 4.32422 4.72865C4.17472 4.8944 4.06515 5.09217 4.00389 5.30681L0.816389 15.9193C0.733697 16.1968 0.733071 16.4922 0.814584 16.77C0.896097 17.0479 1.05627 17.2961 1.27576 17.4849C1.36201 17.568 1.45277 17.6463 1.54764 17.7193H1.55701C3.07576 18.9568 5.07264 19.9037 7.32264 20.4474C7.38022 20.4659 7.4403 20.4754 7.50076 20.4756C7.68619 20.4785 7.86614 20.4126 8.00585 20.2907C8.14556 20.1687 8.23514 19.9993 8.25728 19.8152C8.27942 19.6311 8.23256 19.4453 8.12574 19.2937C8.01893 19.1421 7.85973 19.0354 7.67889 18.9943C6.66737 18.75 5.68397 18.4012 4.74451 17.9537C4.61593 17.8332 4.53388 17.6713 4.51274 17.4964C4.49161 17.3214 4.53274 17.1446 4.62893 16.997C4.72512 16.8494 4.87022 16.7403 5.03878 16.6889C5.20734 16.6376 5.3886 16.6472 5.55076 16.7162C7.33201 17.5037 9.57264 18.0006 12.0008 18.0006C14.4289 18.0006 16.6695 17.5037 18.4508 16.7162C18.6129 16.6472 18.7942 16.6376 18.9627 16.6889C19.1313 16.7403 19.2764 16.8494 19.3726 16.997C19.4688 17.1446 19.5099 17.3214 19.4888 17.4964C19.4676 17.6713 19.3856 17.8332 19.257 17.9537C18.3175 18.4012 17.3341 18.75 16.3226 18.9943C16.1418 19.0354 15.9826 19.1421 15.8758 19.2937C15.769 19.4453 15.7221 19.6311 15.7442 19.8152C15.7664 19.9993 15.856 20.1687 15.9957 20.2907C16.1354 20.4126 16.3153 20.4785 16.5008 20.4756C16.5612 20.4754 16.6213 20.4659 16.6789 20.4474C18.9289 19.9037 20.9258 18.9568 22.4445 17.7193H22.4539C22.5488 17.6463 22.6395 17.568 22.7258 17.4849C22.9453 17.2961 23.1054 17.0479 23.1869 16.77C23.2684 16.4922 23.2678 16.1968 23.1851 15.9193ZM9.00076 14.6256C8.77826 14.6256 8.56075 14.5596 8.37574 14.436C8.19074 14.3123 8.04655 14.1366 7.9614 13.9311C7.87625 13.7255 7.85397 13.4993 7.89738 13.2811C7.94079 13.0629 8.04793 12.8624 8.20527 12.7051C8.3626 12.5477 8.56306 12.4406 8.78128 12.3972C8.99951 12.3538 9.22571 12.376 9.43128 12.4612C9.63685 12.5463 9.81255 12.6905 9.93616 12.8755C10.0598 13.0606 10.1258 13.2781 10.1258 13.5006C10.1258 13.7989 10.0072 14.0851 9.79626 14.2961C9.58528 14.507 9.29913 14.6256 9.00076 14.6256ZM15.0008 14.6256C14.7783 14.6256 14.5607 14.5596 14.3757 14.436C14.1907 14.3123 14.0465 14.1366 13.9614 13.9311C13.8762 13.7255 13.854 13.4993 13.8974 13.2811C13.9408 13.0629 14.0479 12.8624 14.2053 12.7051C14.3626 12.5477 14.5631 12.4406 14.7813 12.3972C14.9995 12.3538 15.2257 12.376 15.4313 12.4612C15.6368 12.5463 15.8125 12.6905 15.9362 12.8755C16.0598 13.0606 16.1258 13.2781 16.1258 13.5006C16.1258 13.7989 16.0072 14.0851 15.7963 14.2961C15.5853 14.507 15.2991 14.6256 15.0008 14.6256Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_2720_30683">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON3 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M23.0994 5.23812C23.0049 5.11165 22.8728 5.01824 22.7221 4.97122C22.5713 4.92421 22.4096 4.92597 22.2599 4.97628C21.3399 5.28565 20.3839 5.47517 19.4154 5.54015C18.8686 4.77044 18.0936 4.19219 17.2001 3.88725C16.3065 3.58231 15.3397 3.56613 14.4365 3.84099C13.5332 4.11586 12.7393 4.66785 12.167 5.41884C11.5948 6.16983 11.2733 7.08177 11.248 8.02558C9.78453 7.72847 8.39513 7.14225 7.16119 6.30127C5.92724 5.46028 4.87357 4.38146 4.06193 3.12801C3.98318 3.007 3.87117 2.9113 3.73935 2.85238C3.60754 2.79347 3.46152 2.77386 3.31883 2.7959C3.17614 2.81794 3.04285 2.8807 2.93495 2.97664C2.82705 3.07258 2.74914 3.19762 2.71057 3.33675C2.05146 5.71921 2.09801 8.24176 2.84458 10.5983C3.59114 12.9548 5.00562 15.044 6.91637 16.6123C5.30856 17.4971 3.50795 17.9733 1.67291 17.999C1.50759 18.0015 1.34772 18.0585 1.21812 18.1612C1.08852 18.2639 0.996444 18.4065 0.956186 18.5668C0.915928 18.7272 0.929741 18.8964 0.995481 19.0481C1.06122 19.1998 1.17521 19.3255 1.31975 19.4058C3.1995 20.4464 5.31171 20.9952 7.46028 21.0013C9.60884 21.0073 11.7241 20.4704 13.6097 19.4404C15.4953 18.4104 17.0901 16.9207 18.246 15.1096C19.4019 13.2985 20.0815 11.2246 20.2217 9.08063C21.3409 8.25752 22.3177 7.2565 23.1131 6.11739C23.2037 5.98805 23.2512 5.83342 23.2487 5.67553C23.2462 5.51765 23.194 5.36457 23.0994 5.23812Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)
const ICON4 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19.5 3H4.5C4.10231 3.00045 3.72105 3.15864 3.43984 3.43984C3.15864 3.72105 3.00045 4.10231 3 4.5V19.5C3.00045 19.8977 3.15864 20.279 3.43984 20.5602C3.72105 20.8414 4.10231 20.9995 4.5 21H19.5C19.8977 20.9995 20.279 20.8414 20.5602 20.5602C20.8414 20.279 20.9995 19.8977 21 19.5V4.5C20.9995 4.10231 20.8414 3.72105 20.5602 3.43984C20.279 3.15864 19.8977 3.00045 19.5 3ZM9 16.5001C9 16.699 8.92098 16.8898 8.78033 17.0304C8.63968 17.1711 8.44891 17.2501 8.25 17.2501C8.05109 17.2501 7.86032 17.1711 7.71967 17.0304C7.57902 16.8898 7.5 16.699 7.5 16.5001V10.5001C7.5 10.3012 7.57902 10.1104 7.71967 9.96976C7.86032 9.82911 8.05109 9.75009 8.25 9.75009C8.44891 9.75009 8.63968 9.82911 8.78033 9.96976C8.92098 10.1104 9 10.3012 9 10.5001V16.5001ZM8.25 8.62509C8.0275 8.62509 7.80999 8.55911 7.62498 8.43549C7.43998 8.31187 7.29578 8.13617 7.21064 7.93061C7.12549 7.72504 7.10321 7.49884 7.14662 7.28061C7.19002 7.06238 7.29717 6.86193 7.4545 6.70459C7.61184 6.54726 7.81229 6.44011 8.03052 6.3967C8.24875 6.3533 8.47495 6.37557 8.68052 6.46072C8.88609 6.54587 9.06179 6.69007 9.1854 6.87507C9.30902 7.06008 9.375 7.27758 9.375 7.50009C9.375 7.79846 9.25647 8.0846 9.0455 8.29558C8.83452 8.50656 8.54837 8.62509 8.25 8.62509ZM17.25 16.5001C17.25 16.699 17.171 16.8898 17.0303 17.0304C16.8897 17.1711 16.6989 17.2501 16.5 17.2501C16.3011 17.2501 16.1103 17.1711 15.9697 17.0304C15.829 16.8898 15.75 16.699 15.75 16.5001V13.1251C15.75 12.6278 15.5525 12.1509 15.2008 11.7993C14.8492 11.4476 14.3723 11.2501 13.875 11.2501C13.3777 11.2501 12.9008 11.4476 12.5492 11.7993C12.1975 12.1509 12 12.6278 12 13.1251V16.5001C12 16.699 11.921 16.8898 11.7803 17.0304C11.6397 17.1711 11.4489 17.2501 11.25 17.2501C11.0511 17.2501 10.8603 17.1711 10.7197 17.0304C10.579 16.8898 10.5 16.699 10.5 16.5001V10.5001C10.4999 10.3157 10.5678 10.1378 10.6906 10.0003C10.8135 9.86283 10.9826 9.77543 11.1659 9.7548C11.3491 9.73417 11.5334 9.78176 11.6838 9.88849C11.8341 9.99521 11.9398 10.1536 11.9808 10.3333C12.488 9.98866 13.0796 9.78877 13.6919 9.75516C14.3042 9.72155 14.9141 9.8555 15.456 10.1426C15.9979 10.4297 16.4513 10.8591 16.7674 11.3846C17.0835 11.9101 17.2503 12.5118 17.25 13.1251V16.5001Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)

const ICON5 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21.6261 6.25711C21.4418 5.09668 20.3809 4.08264 19.2068 3.94815C14.4154 3.426 9.58147 3.42614 4.79011 3.94856C3.62024 4.08259 2.55933 5.09654 2.37412 6.26132C1.79173 10.0662 1.79196 13.9376 2.37481 17.7424C2.55929 18.9029 3.62024 19.9169 4.79404 20.0513C7.1873 20.3123 9.59298 20.443 12.0004 20.4429C14.4079 20.443 16.8136 20.3123 19.2068 20.0513L19.2107 20.0509C20.3807 19.917 21.4417 18.903 21.6267 17.7381C22.2091 13.9332 22.2089 10.0619 21.6261 6.25711V6.25711ZM15.4164 12.6237L10.9164 15.6237C10.8035 15.699 10.6722 15.7423 10.5366 15.7488C10.4011 15.7554 10.2662 15.725 10.1465 15.6609C10.0269 15.5969 9.9268 15.5016 9.85704 15.3851C9.78728 15.2687 9.75044 15.1355 9.75043 14.9997V8.99971C9.75044 8.86396 9.78728 8.73076 9.85704 8.61431C9.9268 8.49786 10.0269 8.40252 10.1465 8.33847C10.2662 8.27442 10.4011 8.24405 10.5366 8.2506C10.6722 8.25716 10.8035 8.30039 10.9164 8.37569L15.4164 11.3757C15.5192 11.4442 15.6034 11.537 15.6617 11.6458C15.7199 11.7547 15.7504 11.8762 15.7504 11.9997C15.7504 12.1232 15.7199 12.2447 15.6617 12.3536C15.6034 12.4625 15.5192 12.5552 15.4164 12.6237V12.6237Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)

const ICON6 = (
  <IconButton>
    <SvgIcon>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.5039 12V7.86512L6.86788 11.6475C6.93531 11.7554 7.02906 11.8443 7.14032 11.906C7.25158 11.9677 7.3767 12 7.5039 12C7.63111 12 7.75622 11.9677 7.86748 11.906C7.97874 11.8443 8.07249 11.7554 8.13992 11.6475L10.5039 7.86512V12C10.305 12 10.1142 12.079 9.97357 12.2197C9.83292 12.3603 9.7539 12.5511 9.7539 12.75C9.7539 12.9489 9.83292 13.1397 9.97357 13.2803C10.1142 13.421 10.305 13.5 10.5039 13.5H12.7539C12.9528 13.5 13.1436 13.421 13.2842 13.2803C13.4249 13.1397 13.5039 12.9489 13.5039 12.75C13.5039 12.5511 13.4249 12.3603 13.2842 12.2197C13.1436 12.079 12.9528 12 12.7539 12H12.0039V6.00001H12.7539C12.9528 6.00001 13.1436 5.92099 13.2842 5.78034C13.4249 5.63968 13.5039 5.44892 13.5039 5.25001C13.5039 5.05109 13.4249 4.86033 13.2842 4.71968C13.1436 4.57902 12.9528 4.50001 12.7539 4.50001H11.2539C11.2502 4.50001 11.2465 4.50051 11.2428 4.50056C11.2283 4.50078 11.2139 4.5017 11.1995 4.50275C11.1885 4.50353 11.1774 4.50426 11.1665 4.5055C11.1545 4.50692 11.1427 4.50898 11.1308 4.51099C11.1179 4.5131 11.1049 4.51516 11.0923 4.51795C11.0826 4.52006 11.0731 4.5228 11.0635 4.52532C11.0494 4.52903 11.0352 4.53269 11.0214 4.53718C11.0126 4.54006 11.004 4.54359 10.9952 4.54679C10.9841 4.55086 10.9728 4.55439 10.962 4.55897C10.9593 4.56007 10.9568 4.56153 10.9542 4.56272C10.9444 4.56693 10.935 4.57192 10.9254 4.57654C10.9136 4.58231 10.9018 4.58785 10.8904 4.59417C10.879 4.60048 10.868 4.60762 10.8569 4.61454C10.8479 4.62017 10.8387 4.62552 10.83 4.63152C10.8179 4.6398 10.8063 4.64891 10.7946 4.65793C10.7873 4.66365 10.7798 4.6691 10.7727 4.67505C10.7615 4.68439 10.7509 4.69451 10.7402 4.70458C10.7348 4.70971 10.7288 4.71437 10.7236 4.71969C10.7219 4.72133 10.7205 4.72321 10.7188 4.7249C10.7097 4.73424 10.701 4.74418 10.6923 4.75411C10.6867 4.76047 10.6806 4.76638 10.6752 4.77292C10.673 4.77558 10.6711 4.77851 10.669 4.78121C10.6621 4.78986 10.6556 4.79893 10.649 4.80794C10.6405 4.81957 10.6321 4.83129 10.6243 4.84342C10.6222 4.84653 10.6199 4.84932 10.6179 4.85248L7.50391 9.83492L4.38992 4.85248C4.38791 4.84932 4.38557 4.84653 4.38356 4.84342C4.37573 4.83129 4.36731 4.81957 4.35879 4.80794C4.35225 4.79892 4.34575 4.78986 4.33883 4.78121C4.33668 4.77851 4.3348 4.77558 4.33266 4.77292C4.32725 4.76638 4.32117 4.76047 4.31554 4.75411C4.30679 4.74422 4.29814 4.73424 4.28899 4.72486C4.28734 4.72321 4.28587 4.72133 4.28422 4.71969C4.27896 4.71442 4.2731 4.70975 4.2677 4.70463C4.25699 4.69451 4.24632 4.68439 4.23511 4.67501C4.22806 4.6691 4.22064 4.66375 4.21336 4.65812C4.20164 4.64901 4.18997 4.63985 4.17779 4.63152C4.1691 4.62552 4.15994 4.62017 4.15097 4.61454C4.13985 4.60762 4.12886 4.60053 4.11742 4.59421C4.10593 4.5878 4.09398 4.58222 4.08212 4.5764C4.07269 4.57182 4.06335 4.56693 4.05374 4.56276C4.05104 4.56157 4.04852 4.56006 4.04582 4.55896C4.03488 4.55429 4.02339 4.55072 4.01218 4.5466C4.00361 4.54349 3.99515 4.54005 3.98649 4.53722C3.97258 4.53269 3.95825 4.52898 3.94397 4.52527C3.93454 4.5228 3.92515 4.52005 3.91563 4.51794C3.90277 4.51515 3.88972 4.51305 3.87663 4.51089C3.86491 4.50897 3.85329 4.50691 3.84148 4.50554C3.8304 4.50426 3.81914 4.50353 3.80792 4.50275C3.79369 4.50169 3.7795 4.50082 3.76521 4.50055C3.76141 4.5005 3.7577 4.5 3.75391 4.5H2.25391C2.05499 4.5 1.86423 4.57902 1.72358 4.71967C1.58292 4.86032 1.50391 5.05109 1.50391 5.25C1.50391 5.44891 1.58292 5.63968 1.72358 5.78033C1.86423 5.92098 2.05499 6 2.25391 6H3.00391V12H2.25391C2.05499 12 1.86423 12.079 1.72358 12.2197C1.58292 12.3603 1.50391 12.5511 1.50391 12.75C1.50391 12.9489 1.58292 13.1397 1.72358 13.2803C1.86423 13.421 2.05499 13.5 2.25391 13.5H4.50391C4.70282 13.5 4.89358 13.421 5.03424 13.2803C5.17489 13.1397 5.25391 12.9489 5.25391 12.75C5.25391 12.5511 5.17489 12.3603 5.03424 12.2197C4.89358 12.079 4.70282 12 4.50391 12L4.5039 12Z"
          fill="white"
        />
        <path
          d="M15.7539 10.5H22.5039C22.7028 10.5 22.8936 10.421 23.0342 10.2803C23.1749 10.1397 23.2539 9.94891 23.2539 9.75C23.2539 9.55109 23.1749 9.36032 23.0342 9.21967C22.8936 9.07902 22.7028 9 22.5039 9H15.7539C15.555 9 15.3642 9.07902 15.2236 9.21967C15.0829 9.36032 15.0039 9.55109 15.0039 9.75C15.0039 9.94891 15.0829 10.1397 15.2236 10.2803C15.3642 10.421 15.555 10.5 15.7539 10.5Z"
          fill="white"
        />
        <path
          d="M22.5039 12H15.7539C15.555 12 15.3642 12.079 15.2236 12.2197C15.0829 12.3603 15.0039 12.5511 15.0039 12.75C15.0039 12.9489 15.0829 13.1397 15.2236 13.2803C15.3642 13.421 15.555 13.5 15.7539 13.5H22.5039C22.7028 13.5 22.8936 13.421 23.0342 13.2803C23.1749 13.1397 23.2539 12.9489 23.2539 12.75C23.2539 12.5511 23.1749 12.3603 23.0342 12.2197C22.8936 12.079 22.7028 12 22.5039 12Z"
          fill="white"
        />
        <path
          d="M22.5039 15H6.75391C6.55499 15 6.36423 15.079 6.22358 15.2197C6.08292 15.3603 6.00391 15.5511 6.00391 15.75C6.00391 15.9489 6.08292 16.1397 6.22358 16.2803C6.36423 16.421 6.55499 16.5 6.75391 16.5H22.5039C22.7028 16.5 22.8936 16.421 23.0342 16.2803C23.1749 16.1397 23.2539 15.9489 23.2539 15.75C23.2539 15.5511 23.1749 15.3603 23.0342 15.2197C22.8936 15.079 22.7028 15 22.5039 15Z"
          fill="white"
        />
        <path
          d="M22.5039 18H6.75391C6.55499 18 6.36423 18.079 6.22358 18.2197C6.08292 18.3603 6.00391 18.5511 6.00391 18.75C6.00391 18.9489 6.08292 19.1397 6.22358 19.2803C6.36423 19.421 6.55499 19.5 6.75391 19.5H22.5039C22.7028 19.5 22.8936 19.421 23.0342 19.2803C23.1749 19.1397 23.2539 18.9489 23.2539 18.75C23.2539 18.5511 23.1749 18.3603 23.0342 18.2197C22.8936 18.079 22.7028 18 22.5039 18Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  </IconButton>
)

export default function Footer(props) {
  const classes = useStyles()
  const { whiteFont } = props
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  })

  const isHomePage = window.location.hash === '#/'
  const isLayoutSm = useMediaQuery('(max-width: 960px)')

  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <GridContainer>
          <GridItem
            xs={12}
            sm={12}
            md={4}
            className={classNames(classes.item, {
              [classes.left]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <a className={classes.title} rel="noopener noreferrer" href="/#/">
              <img alt="" src="/logo.svg" style={{ width: 228, height: 36 }} />
            </a>
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={8}
            className={classNames(classes.item, {
              [classes.right]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a
                  className={classes.block}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${DOCUMENT_URL}/docs/protocol-mechanisms/protocol-algorithm-design`}
                >
                  BoC Protocol
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={'https://governance.bankofchain.io'}>
                  Governance
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={DOCUMENT_URL}>
                  Docs
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a
                  className={classes.block}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${DOCUMENT_URL}/docs/protocol-mechanisms/security-risk`}
                >
                  Security
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a className={classes.block} target="_blank" rel="noopener noreferrer" href={`${DOCUMENT_URL}/docs/more/faqs`}>
                  FAQ
                </a>
              </ListItem>
            </List>
          </GridItem>
          <Divider />
          <GridItem
            xs={12}
            sm={12}
            md={5}
            className={classNames(classes.item, {
              [classes.left]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <p className={classes.text}>@{1900 + new Date().getYear()} Bank of Chain, all rights reserved.</p>
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={7}
            className={classNames(classes.item, {
              [classes.right]: !isLayoutSm,
              [classes.center]: isLayoutSm
            })}
          >
            <p>
              Any further queries? Contact us at <a className={classes.email}>contact@bankofchain.io</a>
            </p>
          </GridItem>
          <Divider />
          <GridItem xs={12} sm={12} md={12} className={classNames(classes.item, classes.center)}>
            <List className={classes.list}>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={TELEGRAM_URL}>
                  {ICON1}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={COMMUNITY_URL}>
                  {ICON2}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={TWITTER_URL}>
                  {ICON3}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={LINKEDIN_URL}>
                  {ICON4}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={YOUTUBE_URL}>
                  {ICON5}
                </a>
              </ListItem>
              <ListItem className={classes.inlineBlock}>
                <a target="_blank" rel="noopener noreferrer" href={MEDIUM_URL}>
                  {ICON6}
                </a>
              </ListItem>
            </List>
          </GridItem>
          {isHomePage && (
            <GridItem xs={12} sm={12} md={12} className={classNames(classes.item, classes.disclaimer)}>
              <p>DISCLAIMER</p>
              <p>
                Bank of Chain (“BoC”) is a decentralized yield generation protocol designed for the community to invest in the DeFi investment
                ecosystem. BoC is a non-audited, open-source protocol, which includes a set of smart contracts that are deployed on the Ethereum
                Blockchain and Polygon networks respectively. Your use of the BoC protocol involves various risks, including, but not limited to,
                losses due to the fluctuation of prices of tokens in a vault, trading pair, liquidity pool, lending contracts, or any other smart
                contracts (“Risks”). Your use of BoC shall be at your own risk. Please remember to not invest more than what you can afford to lose.
                Before using BoC, you are expected to review the relevant documentation, ensuring that you fully understand how the BoC protocol
                works. BoC or its affiliates shall not be liable for any losses you may suffer arising from the use of BoC or due to the Risks.
              </p>
              <p>
                BOC OR ITS AFFILIATES, MAKE NO REPRESENTATIONS OR WARRANTIES CONCERNING ANY SERVICES, OR FACILITIES PROVIDED UNDER THE BOC PROTOCOL.
                ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING WITHOUT LIMITATION ANY AND ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF THIRD PARTY RIGHTS) ARE HEREBY. DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE
                LAW.
              </p>
            </GridItem>
          )}
          {!isProEnv(ENV) && (
            <GridItem xs={12} sm={12} md={12} style={{ borderTop: '1px solid #ccc' }} className={classNames(classes.item, classes.center)}>
              <List className={classes.list}>
                <ListItem className={classes.inlineBlock}>Branch&nbsp;:&nbsp;{PUBLISH_BRANCH}&nbsp;</ListItem>
                <ListItem className={classes.inlineBlock}>Date&nbsp;:&nbsp;{PUBLISH_TIME}&nbsp;</ListItem>
                <ListItem className={classes.inlineBlock}>Env&nbsp;:&nbsp;{ENV}&nbsp;</ListItem>
              </List>
            </GridItem>
          )}
        </GridContainer>
      </div>
    </footer>
  )
}
