import React from "react";
import { makeStyles } from "@material-ui/core/styles";

// === Components === //
import InfoArea from "@/components/InfoArea/InfoArea";

// === Utils === //
import map from "lodash/map";
import useMediaQuery from "@material-ui/core/useMediaQuery";

// === Styles === //
import styles from "./productStyle";

import { Navigation, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react";
import "swiper/swiper-bundle.min.css";

const useStyles = makeStyles(styles);

const data = [
  {
    title: "Smart",
    descriptions: [
      "Regularly calibrate the yield, and weigh the cost and reward of reallocation.",
      "Search for the best rate through exchange aggregators.",
      "Complex FX interest swap. Adjusting FX synthesis based on exchange rate and yield.",
      "Automatically set parameters for market-making and lending strategy.",
    ],
    imagePath: require("./../images/point-6.png"),
  },
  {
    title: "Easy to Use",
    descriptions: [
      "Only deposit and withdraw, no necessary to implement and bear the cost of complex operations such as harvest, exchange, and reallocation.",
      "Automatically reinvest. Flexible deposit and withdrawal.",
      "Yield generations are visible.",
    ],
    imagePath: require("./../images/point-3.png"),
  },
  {
    title: "Safe",
    descriptions: [
      "Market cap of qualified stablecoins exceeds 1 billion dollars.",
      "The TVL of qualified Blockchains exceeds 5 billion dollars.",
      "Third-party auditing.",
      "Only official cross-chain bridge.",
      "Price Quotation relies on Oracle.",
    ],
    imagePath: require("./../images/point-1.png"),
  },
  {
    title: "Risk control",
    descriptions: [
      "De-anchoring risk: no algorithmic stablecoin, No partially collateralized stablecoin, No stablecoin collateralized by a long-tail asset.",
      "Risk of impermanent loss: market-making only for stablecoin pairs.",
      "Systemic risk: very selective wrapped tokens and yield aggregators.",
      "Long-tail risk: no yield generated from risk-taking, such as insurance underwriting, sell call options.",
      "Leverage risk: no leverage in this version.",
    ],
    imagePath: require("./../images/point-5.png"),
  },
  {
    title: "Third-Party Risk Diversification",
    descriptions: [
      "Investment in a single protocol shall not exceed 30% of the total capital.",
      "Investment in a single capital pool shall not exceed 20% of the total capital.",
      "Investment in a single capital pool shall not exceed 50% of the existing capital in that pool.",
    ],
    imagePath: require("./../images/point-4.png"),
  },
];

export default function ProductSection() {
  const classes = useStyles();
  const isLayoutSm = useMediaQuery("(max-width: 960px)");
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
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          autoplay={true}
        >
          {map(data, (item, i) => {
            const { title, descriptions = [], imagePath } = item;
            return (
              <SwiperSlide key={i}>
                <InfoArea
                  title={title}
                  description={map(descriptions, (d, index) => (
                    <span
                      key={`item-${index}`}
                      style={{ display: "inline-block" }}
                    >
                      {index + 1}. {d}
                    </span>
                  ))}
                  icon={<img src={imagePath} alt="" />}
                  vertical
                  style={{
                    height: "40rem",
                    padding: isLayoutSm ? "2rem" : "6rem 3rem 3rem",
                  }}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
      </div>
    </div>
  );
}
