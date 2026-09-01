import React, { useState } from "react";
import { socket } from "../socket";

function Lobby() {
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = () => {
    socket.emit("create_room");
  };

  const handleJoinRoom = () => {
    if (joinCode.trim().length !== 4) {
      alert("enter a valid 4 digit code");
      return;
    }
    socket.emit("join_room", joinCode.toUpperCase());
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Welcome to IPL mock auction</h2>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "30px",
          borderRadius: "10px",
          display: "inline-block",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Create Room section  */}
        <div style={{ marginBottom: "30px" }}>
          <h3>Host a new game</h3>
          <button
            onClick={handleCreateRoom}
            style={{
              padding: "12px 24px",
              fontSize: "1.1rem",
              cursor: "pointer",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
          >
            Create room
          </button>
        </div>
        <hr style={{ borderColor: "#ddd", marginBottom: "30px" }} />
        <div>
          <h3>Join an existing game</h3>
          <input
            type="text"
            placeholder="enter 4 digit room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            style={{
              padding: "10px",
              fontSize: "1.1rem",
              width: "180px",
              textAlign: "center",
              marginRight: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleJoinRoom}
            style={{
              padding: "10px 20px",
              fontSize: "1.1rem",
              cursor: "pointer",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
          >
            join
          </button>
        </div>
      </div>
      <div
        style={{
          marginTop: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "10px" }}>
          Built by a B.Tech student. If your squad is enjoying the game,
          <br />
          help keep the cloud servers running! ☕
        </p>
        <a
          href="https://www.buymeacoffee.com/cartikeya"
          target="_blank"
          rel="noreferrer"
          style={{ transition: "transform 0.2s ease" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            style={{
              height: "50px",
              width: "180px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          />
        </a>
      </div>
    </div>
  );
}
export default Lobby;
