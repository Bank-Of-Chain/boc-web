import { INVEST_TAB } from "@/constants/invest";

test("INVEST_TAB has 3 items", () => {
  expect(Object.keys(INVEST_TAB).length).toBe(3);
});
