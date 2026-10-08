import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { socket } from "./socket";

jest.mock("./socket", () => ({
  API_BASE_URL: "http://localhost:3001",
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

beforeEach(() => {
  window.sessionStorage.clear();
  jest.clearAllMocks();
});

function mockSavedRoomSession() {
  window.sessionStorage.setItem("project-c.auth-token", "test-session-token");
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      user: {
        id: "user-1",
        name: "Auction Host",
        activeRoomId: "AB12",
        activeTeamName: "CSK",
      },
    }),
  });
}

test("requires Google sign-in before entering an auction", async () => {
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

test("offers Continue or Create New Game instead of automatically restoring a saved room", async () => {
  mockSavedRoomSession();
  render(<App />);

  expect(await screen.findByRole("heading", { name: /how would you like to play/i })).toBeInTheDocument();
  expect(screen.getByText("AB12")).toBeInTheDocument();
  expect(screen.getByText(/playing as/i)).toHaveTextContent("CSK");
  expect(socket.emit).not.toHaveBeenCalledWith("restore_session");

  fireEvent.click(screen.getByRole("button", { name: /continue saved game/i }));
  expect(socket.emit).toHaveBeenCalledWith("restore_session");
});

test("creates a new game from the saved-room choice", async () => {
  mockSavedRoomSession();
  render(<App />);
  expect(await screen.findByRole("heading", { name: /how would you like to play/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /create a new game/i }));
  expect(socket.emit).toHaveBeenCalledWith("create_room");
  expect(socket.emit).not.toHaveBeenCalledWith("restore_session");
});

test("offers existing-room join and a way back to saved-game choices", async () => {
  mockSavedRoomSession();
  render(<App />);
  expect(await screen.findByRole("heading", { name: /how would you like to play/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /join an existing room/i }));
  expect(screen.getByRole("heading", { name: /have a room code/i })).toBeInTheDocument();
  const codeField = screen.getByLabelText(/four-letter room code/i);
  expect(codeField).toHaveFocus();

  fireEvent.change(codeField, { target: { value: "wxyz" } });
  fireEvent.click(screen.getByRole("button", { name: /^join/i }));
  expect(socket.emit).toHaveBeenCalledWith("join_room", "WXYZ");

  fireEvent.click(screen.getByRole("button", { name: /saved game choices/i }));
  expect(screen.getByRole("heading", { name: /how would you like to play/i })).toBeInTheDocument();
});
