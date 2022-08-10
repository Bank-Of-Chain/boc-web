import { toFixed, formatBalance } from "./../../helpers/number-format";

test("number-format toFixed", () => {
  const text = toFixed("10000", "100");
  expect(text).toBe("100");
});

test("number-format toFixed formatBalance", () => {
  formatBalance;
  const text = formatBalance("10000", 2);
  expect(text).toBe("100");
});
