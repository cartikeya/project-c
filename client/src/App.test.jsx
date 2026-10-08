import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("./socket", () => ({
  API_BASE_URL: "http://localhost:3001",
  socket: { on: jest.fn(), off: jest.fn(), emit: jest.fn(), connect: jest.fn(), disconnect: jest.fn() },
}));

test("requires Google sign-in before entering an auction", async () => {
  window.sessionStorage.clear();
  window.google = {
    accounts: {
      id: {
        initialize: jest.fn(),
        renderButton: jest.fn(),
        cancel: jest.fn(),
      },
    },
  };

  render(<App />);

  expect(await screen.findByRole("heading", { name: /sign in to keep your place/i })).toBeInTheDocument();
  expect(screen.getByText(/Google verifies your identity/i)).toBeInTheDocument();
  await waitFor(() => expect(window.google.accounts.id.renderButton).toHaveBeenCalled());
  expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: expect.any(String) }));
});
