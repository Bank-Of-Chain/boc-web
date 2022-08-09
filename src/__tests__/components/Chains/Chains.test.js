import React from "react";
import { render } from "@testing-library/react";
import Chains from "../../../components/Chains/Chains";

test("Chains Component Render", () => {
  const { asFragment } = render(<Chains />);
  expect(asFragment()).toMatchSnapshot();
});
