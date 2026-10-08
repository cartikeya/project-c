import React, { useState } from "react";
import { socket } from "../socket";

function Login({ setMyTeamName, handleSetTeam, takenTeamNames, roomId }) {
  const names = ["CSK", "MI", "RCB", "SRH", "RR", "PBKS", "KKR", "DC", "GT", "LSG"];
  const [selected, setSelected] = useState(null);

  const handleJoinClick = () => {
    if (!selected) return;
    socket.emit("join_game", { teamName: selected, roomId: roomId });
    setMyTeamName(selected);
    handleSetTeam();
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
              disabled={isTaken}
              aria-pressed={isSelected}
              onClick={() => setSelected(name)}
            >
              <span className="team-option-mark">{name.slice(0, 1)}</span>
              <span className="team-option-name">{name}</span>
              <span className="team-option-status">{isTaken ? "IN ROOM" : isSelected ? "SELECTED" : "AVAILABLE"}</span>
            </button>
          );
        })}
      </div>
      <div className="join-action-row">
        <span className="selection-hint">{selected ? `${selected} is ready to join` : "Choose a franchise to continue"}</span>
        <button className="button button-primary" type="button" disabled={!selected} onClick={handleJoinClick}>
          Join auction <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}

export default Login;
