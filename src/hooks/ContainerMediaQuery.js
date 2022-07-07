import useMediaQuery from "@material-ui/core/useMediaQuery";
import find from "lodash/find";

export default function useContainerMediaQuery() {
  const isSm = useMediaQuery("(min-width: 576px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 992px)");
  const isXl = useMediaQuery("(min-width: 1200px)");

  const mediaConfig = [
    {
      key: "xl",
      condition: isXl,
    },
    {
      key: "lg",
      condition: isLg,
    },
    {
      key: "md",
      condition: isMd,
    },
    {
      key: "sm",
      condition: isSm,
    },
    {
      key: "xs",
      condition: !isXl && !isLg && !isMd && !isSm,
    },
  ];
  const mediaLabel = find(mediaConfig, o => o.condition)?.key;

  return {
    isXl,
    isLg,
    isMd,
    isSm,
    isXs: !isSm && !isMd && !isLg && !isXl,
    mediaLabel: mediaLabel,
  };
}
