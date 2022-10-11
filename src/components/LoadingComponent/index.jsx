import React from 'react'

const Loading = props => {
  const { loading, children = '', width = '20px', height = '20px', background, className } = props
  const loadingElement = (
    <svg className={className} style={{ background: background }} width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
      <circle cx="16" cy="50" r="10" fill="#e15b64">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
      </circle>
      <circle cx="50" cy="50" r="10" fill="#f47e60">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.4629629629629629s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.4629629629629629s"
        ></animate>
      </circle>
      <circle cx="84" cy="50" r="10" fill="#f8b26a">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.9259259259259258s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.9259259259259258s"
        ></animate>
      </circle>
      <circle cx="16" cy="50" r="10" fill="#abbd81">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1.3888888888888888s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="1.8518518518518516s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1.3888888888888888s"
        ></animate>
      </circle>
    </svg>
  )
  return loading ? loadingElement : children
}

export default Loading
