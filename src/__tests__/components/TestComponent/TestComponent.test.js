import React from "react";
import { render } from "@testing-library/react";
import TestComponent from "../../../components/TestComponent/TestComponent";

test("TestComponent Component Render", () => {
  const { queryByText } = render(<TestComponent />);
  expect(queryByText("TestComponent")).toBeTruthy();
});
