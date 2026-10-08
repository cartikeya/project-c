import React, { useState } from "react";
import { socket } from "../socket";

function Login({ setMyTeamName, handleSetTeam, takenTeamNames, roomId }) {
  const names = ["CSK", "MI", "RCB", "SRH", "RR", "PBKS", "KKR", "DC", "GT", "LSG"];
  const [selected, setSelected] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleJoinClick = () => {
    if (!selected || joining) return;
    setJoining(true);
    setJoinError("");
    socket.timeout(8000).emit("join_game", { teamName: selected, roomId }, (timeoutError, response) => {
      setJoining(false);
      if (timeoutError) {
        setJoinError("The server did not respond. Please try again.");
        return;
      }
      if (!response?.ok) {
        setJoinError(response?.message || "That franchise could not be selected. Please choose again.");
        return;
      }
      setMyTeamName(response.teamName);
      handleSetTeam();
    });
  };

  return (
    <div className="team-picker">
      <p className="picker-helper">Select an available team to join this auction.</p>
      <div className="team-grid">
        {names.map((name) => {
          const isTaken = takenTeamNames.includes(name);
          const isSelected = selected === name;
          return (
            <button
              key={name}
              type="button"
              className={`team-option${isSelected ? " is-selected" : ""}${isTaken ? " is-taken" : ""}`}
              disabled={isTaken || joining}
              aria-pressed={isSelected}
              onClick={() => { setSelected(name); setJoinError(""); }}
            >
              <span className="team-option-mark">{name.slice(0, 1)}</span>
              <span className="team-option-name">{name}</span>
              <span className="team-option-status">{isTaken ? "IN ROOM" : isSelected ? "SELECTED" : "AVAILABLE"}</span>
            </button>
          );
        })}
      </div>
      <div className="join-action-row">
        <span className="selection-hint" role={joinError ? "alert" : undefined}>
          {joinError || (selected ? `${selected} is ready to join` : "Choose a franchise to continue")}
        </span>
        <button className="button button-primary" type="button" disabled={!selected || joining} onClick={handleJoinClick}>
          {joining ? "Joining…" : "Join auction"} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}

export default Login;
