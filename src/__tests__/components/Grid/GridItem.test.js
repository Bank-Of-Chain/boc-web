import React from "react";
import { render } from "@testing-library/react";
import GridItem from "../../../components/Grid/GridItem";

test("GridItem Component Render", () => {
  const { asFragment } = render(<GridItem />);
  expect(asFragment()).toMatchSnapshot();
});
