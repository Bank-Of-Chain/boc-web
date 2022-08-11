import { renderHook, act } from "@testing-library/react-hooks";
import useTestHooks from "../../hooks/useTestHooks";

test("useTestHooks hooks render", () => {
  const { result } = renderHook(() => useTestHooks());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
