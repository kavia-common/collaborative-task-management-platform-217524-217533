import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome copy", () => {
  render(<App />);
  const el = screen.getByText(/Welcome to TaskBoards/i);
  expect(el).toBeInTheDocument();
});
