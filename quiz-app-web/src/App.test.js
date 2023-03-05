import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders first quiz question", () => {
  render(<App />);
  expect(
    screen.getByText("Is Milkyway the biggest galaxy in Universe?")
  ).toBeInTheDocument();
});
