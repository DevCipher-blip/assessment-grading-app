import { formatClock } from "./useRemaining";

describe("formatClock", () => {
  it.each([
    [180000, "3:00"],
    [179001, "3:00"],
    [61000, "1:01"],
    [9000, "0:09"],
    [0, "0:00"],
  ])("formats %i ms as %s", (ms, expected) => {
    expect(formatClock(ms)).toBe(expected);
  });
});
