// client/src/components/PlayerPool.js
import React, { useState } from "react";

function PlayerPool({ playersList, currentPlayer }) {
  // --- NEW: State to track which role tab is clicked ---
  const [selectedRole, setSelectedRole] = useState("All");

  if (!playersList || playersList.length === 0) return null;

  // 1. Find the current player's index
  const currentIndex = currentPlayer 
    ? playersList.findIndex((player) => player.name === currentPlayer.name) 
    : 0;

  // 2. Get the remaining players
  const remainingPlayers = currentIndex >= 0 ? playersList.slice(currentIndex) : playersList;

  // --- NEW: Extract unique roles from the remaining players ---
  // Using Set to easily remove duplicates, and adding "All" at the front
  const uniqueRoles = ["All", ...new Set(remainingPlayers.map((p) => p.role || "Other"))];

  // --- NEW: Filter the players to show based on the selected tab ---
  const displayedPlayers = selectedRole === "All" 
    ? remainingPlayers 
    : remainingPlayers.filter((p) => (p.role || "Other") === selectedRole);

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        border: "1px solid #eee",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>
        <h3 style={{ margin: "0" }}>
          🏏 Upcoming Players ({remainingPlayers.length} Total Remaining)
        </h3>
      </div>

      {/* --- NEW: Role Filter Buttons --- */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
        {uniqueRoles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: selectedRole === role ? "none" : "1px solid #ccc",
              background: selectedRole === role ? "#007bff" : "#f1f1f1",
              color: selectedRole === role ? "white" : "#333",
              cursor: "pointer",
              fontWeight: selectedRole === role ? "bold" : "normal",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Scrollable Container */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "15px",
          padding: "15px 5px",
          scrollbarWidth: "thin",
        }}
      >
        {displayedPlayers.length === 0 ? (
          <div style={{ padding: "20px", color: "#888", fontStyle: "italic", width: "100%", textAlign: "center" }}>
            No players left in this category!
          </div>
        ) : (
          displayedPlayers.map((player, index) => {
            // Check if this specific player is the one currently on the block
            const isCurrent = currentPlayer && currentPlayer.name === player.name;

            return (
              <div
                key={index}
                style={{
                  minWidth: "120px",
                  padding: "15px 10px",
                  borderRadius: "8px",
                  background: isCurrent ? "#fff3cd" : "#f8f9fa",
                  border: isCurrent ? "2px solid #ffc107" : "1px solid #ddd",
                  textAlign: "center",
                  transform: isCurrent ? "scale(1.05)" : "scale(1)",
                  transition: "transform 0.2s ease, border 0.2s ease",
                  boxShadow: isCurrent ? "0 4px 8px rgba(255, 193, 7, 0.3)" : "none",
                  opacity: isCurrent ? 1 : 0.8,
                }}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${player.name.replace(" ", "+")}&size=50&background=random&color=fff`}
                  alt={player.name}
                  style={{ borderRadius: "50%", marginBottom: "10px" }}
                />
                <div style={{ fontSize: "0.9rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {player.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#007bff", marginTop: "3px", fontWeight: "500" }}>
                  {player.role || "Player"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
                  ₹{player.basePrice || 20}L
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PlayerPool;