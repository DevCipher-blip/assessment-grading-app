import { render, screen } from "@testing-library/react";

import App from "./App.jsx";

test("opens on the Goalpost intro", () => {
  render(<App />);
  expect(screen.getByText("Goalpost")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Begin" })).toBeInTheDocument();
});
