// client/src/components/PlayerPool.js
import React from "react";

function PlayerPool({ playersList, currentPlayer }) {
  if (!playersList || playersList.length === 0) return null;

  // --- NEW LOGIC: Filter out completed players ---
  // 1. Find where the current player is in the master list (Default to 0 if none)
  const currentIndex = currentPlayer 
    ? playersList.findIndex((player) => player.name === currentPlayer.name) 
    : 0;

  // 2. Chop off everyone who came before this index
  // (If currentIndex is somehow -1, just show the whole list)
  const remainingPlayers = currentIndex >= 0 ? playersList.slice(currentIndex) : playersList;

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
      <h3
        style={{
          textAlign: "left",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
          marginTop: "0",
        }}
      >
        {/* Update the title to show remaining count! */}
        🏏 Upcoming Players ({remainingPlayers.length} Remaining)
      </h3>

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
        {remainingPlayers.map((player, index) => {
          // Because we sliced the array, the very first person (index 0) 
          // will ALWAYS be the current player on the block (if game has started)
          const isCurrent = currentPlayer && index === 0;

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
                boxShadow: isCurrent
                  ? "0 4px 8px rgba(255, 193, 7, 0.3)"
                  : "none",
                opacity: isCurrent ? 1 : 0.8,
              }}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${player.name.replace(" ", "+")}&size=50&background=random&color=fff`}
                alt={player.name}
                style={{ borderRadius: "50%", marginBottom: "10px" }}
              />
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {player.name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
                ₹{player.basePrice || 20}L
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerPool;