import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders first quiz question", () => {
  render(<App />);
  expect(
    screen.getByText("Explain how you would validate an API request.")
  ).toBeInTheDocument();
});
