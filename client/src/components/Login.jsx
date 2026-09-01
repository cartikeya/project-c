import React, { useState } from "react";
import { socket } from "../socket";

function Login({ setMyTeamName, handleSetTeam, takenTeamNames, roomId }) {
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

    socket.emit("join_game", { teamName: selected, roomId: roomId });

    setMyTeamName(selected);
    handleSetTeam();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Select your TEAM name: </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {names.map((name) => {
          const isTaken = takenTeamNames.includes(name);

          return (
            <button
              key={name}
              disabled={isTaken}
              onClick={() => setSelected(name)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                // 2. STYLING LOGIC:
                border: isTaken
                  ? "1px solid #ccc" // Taken: Grey border
                  : selected === name
                    ? "2px solid #4f46e5" // Selected: Blue border
                    : "1px solid #ccc", // Normal: Grey border

                backgroundColor: isTaken
                  ? "#e0e0e0" // Taken: Grey background
                  : selected === name
                    ? "#4f46e5" // Selected: Blue background
                    : "white", // Normal: White

                color: isTaken
                  ? "#999" // Taken: Grey text
                  : selected === name
                    ? "white" // Selected: White text
                    : "black", // Normal: Black text

                cursor: isTaken ? "not-allowed" : "pointer",
                fontWeight: "bold",
                minWidth: "80px",
                position: "relative", // For the "X" overlay if you want
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

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
