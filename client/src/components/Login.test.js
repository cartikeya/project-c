import { act, fireEvent, render, screen } from "@testing-library/react";
import { takeAck } from "../socket";
import Login from "./Login";

jest.mock("../socket", () => {
  const acknowledgements = [];
  return {
    socket: {
      timeout: () => ({
        emit: (_event, _payload, acknowledge) => acknowledgements.push(acknowledge),
      }),
    },
    takeAck: (index) => acknowledgements[index],
  };
});

test("does not enter a franchise until the server acknowledges ownership", () => {
  const setMyTeamName = jest.fn();
  const handleSetTeam = jest.fn();
  render(
    <Login
      setMyTeamName={setMyTeamName}
      handleSetTeam={handleSetTeam}
      takenTeamNames={[]}
      roomId="A1B2"
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: /CSK AVAILABLE/ }));
  fireEvent.click(screen.getByRole("button", { name: /join auction/i }));
  expect(setMyTeamName).not.toHaveBeenCalled();
  expect(handleSetTeam).not.toHaveBeenCalled();

  act(() => takeAck(0)(null, { ok: false, message: "That franchise is already taken in this room." }));
  expect(screen.getByRole("alert")).toHaveTextContent(/already taken/i);
  expect(setMyTeamName).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: /join auction/i }));
  act(() => takeAck(1)(null, { ok: true, teamName: "CSK" }));
  expect(setMyTeamName).toHaveBeenCalledWith("CSK");
  expect(handleSetTeam).toHaveBeenCalledTimes(1);
});
