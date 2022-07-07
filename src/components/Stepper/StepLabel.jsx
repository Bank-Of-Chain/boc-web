import { withStyles } from "@material-ui/core/styles";
import StepLabel from "@material-ui/core/StepLabel";

const BocStepLabel = withStyles({
  label: {
    color: "#fff",
  },
  active: {
    color: "rgba(255, 255, 255, 0.87) !important",
  },
  completed: {
    color: "rgba(255, 255, 255, 0.87) !important",
  },
})(StepLabel);

export default BocStepLabel;
