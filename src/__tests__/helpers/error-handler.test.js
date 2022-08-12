import { errorTextOutput, isEs, isAd } from "@/helpers/error-handler";

test("isAd logic correctly", () => {
  const errorMsg = "xxxxxx'AD'";
  const flag = isAd(errorMsg);
  expect(flag).toBeTruthy();
});

test("isEs logic correctly", () => {
  const errorMsg = "xxxxxx'ES'";
  const flag = isEs(errorMsg);
  expect(flag).toBeTruthy();
});

test("errorTextOutput return correctly", () => {
  const text = "xxxxxxis'AD'";
  const error = new Error(text);
  const flag = errorTextOutput(error);
  expect(flag).toBe(text);
});

test("errorTextOutput return correctly", () => {
  const text = "xxxxxxis'AD'";
  const error = {
    error: {
      data: {
        message: text,
      },
    },
  };
  const flag = errorTextOutput(error);
  expect(flag).toBe(text);
});
