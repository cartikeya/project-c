import React, { useState } from "react";
import { socket } from "../socket";

function Login({ myTeamName, setMyTeamName, handleSetTeam }) {
  const names = [
    "CSK",
    "MI",
    "RCB",
    "SRH",
    "RR",
    "PBKS",
    "KKR",
    "DC",
    "GT",
    "LSG",
  ];
  const [selected, setSelected] = useState(null);

  const handleJoinClick = () => {
    if (!selected) return;

    socket.emit("join_game", selected);

    setMyTeamName(selected);

    handleSetTeam();
  };

  return (
    <div>
      <h2>Select your TEAM name: </h2>
      {names.map((name) => (
        <button
          key={name}
          onClick={() => setSelected(name)}
          style={{
            margin: "8px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: selected === name ? "#4f46e5" : "white",
            color: selected === name ? "white" : "black",
            cursor: "pointer",
          }}
        >
          {name}
        </button>
      ))}
      <br />
      <button
        disabled={!selected}
        onClick={handleJoinClick}
        style={{
          padding: "15px 40px",
          marginTop: "20px",
          fontSize: "1.2rem",
          cursor: !selected ? "not-allowed" : "pointer",
          background: !selected ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          transition: "0.3s",
          borderRadius: "100px",
        }}
      >
        {/* {selected ? `join as ${selected}` : "select a team"} */}
        JOIN
      </button>
    </div>
  );
}

export default Login;
