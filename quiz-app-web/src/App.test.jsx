import { render, screen } from "@testing-library/react";

import App from "./App.jsx";

test("renders first quiz question", () => {
  render(<App />);
  expect(screen.getByText(/Describe one goal you are working toward/)).toBeInTheDocument();
});
