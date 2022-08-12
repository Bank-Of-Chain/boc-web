import React from "react";
import { render } from "@testing-library/react";
import CustomButtons from "@/components/CustomButtons/Button";

test("CustomButtons Component Render", () => {
  const { asFragment } = render(<CustomButtons className="abc" />);
  expect(asFragment()).toMatchSnapshot();
});
