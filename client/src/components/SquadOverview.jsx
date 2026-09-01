// client/src/components/SquadOverview.js
import React from "react";

// --- NEW: Helper function to convert Lakhs to Crores visually ---
const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return "???";
  if (amount >= 100) {
    return `₹ ${amount / 100} Cr`; // e.g., 150 becomes 1.5 Cr
  }
  return `₹ ${amount} L`;
};

function SquadOverview({ teamsData }) {
  if (!teamsData || Object.keys(teamsData).length === 0) return null;

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        border: "1px solid #ddd",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
          marginTop: "0",
        }}
      >
        🏆 Team Squads & Spending
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {Object.entries(teamsData).map(([teamName, teamInfo]) => (
          <div
            key={teamName}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
              minWidth: "220px",
              background: "#f9f9f9",
              flex: "1 1 200px",
              maxWidth: "300px",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#333",
                fontSize: "1.2rem",
                textAlign: "center",
              }}
            >
              {teamName}
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#28a745",
              }}
            >
              <span>Purse:</span>
              {/* Apply the formatter to the team's remaining budget */}
              <span>{formatPrice(teamInfo.budget)}</span>
            </div>

            <hr style={{ borderColor: "#ddd" }} />

            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {teamInfo.squad.length === 0 ? (
                <li
                  style={{
                    color: "#888",
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    padding: "10px 0",
                  }}
                >
                  No players bought yet
                </li>
              ) : (
                teamInfo.squad.map((player, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "0.95rem",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "130px",
                      }}
                    >
                      {player.name}
                    </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#d32f2f",
                        backgroundColor: "#ffebee",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                      }}
                    >
                      {/* Apply the formatter to the player's sold price */}
                      {formatPrice(player.soldPrice)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SquadOverview;
