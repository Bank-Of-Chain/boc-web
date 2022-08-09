import { renderHook, act } from "@testing-library/react-hooks";
import useTestHooks from "../../hooks/useTestHooks";

test("TestComponent Component Render", () => {
  const { result } = renderHook(() => useTestHooks());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
