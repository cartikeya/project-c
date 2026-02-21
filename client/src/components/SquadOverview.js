import React from "react";

function SquadOverview({ teamsData }) {
  const teamNames = Object.keys(teamsData);
  if (teamNames.length === 0) {
    return (
      <div style={{ color: "#777", marginTop: "20px" }}>No teams joined</div>
    );
  }
  return (
    <div
      style={{
        marginTop: "40px",
        borderTop: "2px solid #eee",
        paddingTop: "20px",
      }}
    >
      <h2>Tournament status</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {teamNames.map((teamName) => {
          const team = teamsData[teamName];
          return (
            <div
              key={teamName}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                width: "250px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBlock: "10px",
                }}
              >
                <h3 style={{ margin: 0, color: "#333" }}>{teamName}</h3>
                <span
                  style={{
                    backgroundColor: team.budget < 200 ? "#dc3545" : "#28a745",
                    color: "white",
                    padding: "2px 8px ",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  ₹{team.budget / 100}Cr
                </span>
              </div>
              <hr style={{ borderColor: "#ccc" }} />
              <h4
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  margin: "10px 0 5px 0",
                }}
              >
                Squad: ({team.squad.length})
              </h4>

              {team.squad.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    fontFamily: "italic",
                  }}
                >
                  No players yet
                </p>
              ) : (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {team.squad.map((player, idx) => (
                    <li
                      key={idx}
                      style={{ fontsize: "0.85rem", marginBottom: "4px" }}
                    >
                      <strong>{player.name}</strong>
                      <span style={{ color: "#555" }}>({player.role})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SquadOverview;
