import { PLATFORM_HOME_URL, STRATEGIES } from "@/constants/amms";

STRATEGIES.map((i) => {
  test(`${i} has platform link`, () => {
    expect(PLATFORM_HOME_URL[i]).toBeTruthy();
  });
});
