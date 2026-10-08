import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./socket", () => ({
  socket: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
}));

test("renders the auction room entry actions", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /start a new room/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /create room/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^join/i })).toBeInTheDocument();
});
