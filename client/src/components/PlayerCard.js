import React from "react";

function PlayerCard({
  currentPlayer,
  currentBid,
  currentLeader,
  placeBid,
  isTeamSet,
  isWinning,
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={currentPlayer.img}
        alt={currentPlayer.name}
        style={{
          width: "100%",
          height: "250px",
          objectFit: "cover",
          borderRadius: "5px",
        }}
      />
      <h2 style={{ margin: "10px 0 5px 0" }}>{currentPlayer.name}</h2>
      <p style={{ color: "#555", margin: "0" }}>{currentPlayer.role}</p>

      <div
        style={{
          margin: "20px 0",
          padding: "10px",
          background: "#fff",
          borderRadius: "5px",
          border: "1px solid #eee",
        }}
      >
        <h3 style={{ margin: "0" }}>Current Bid: {currentBid} lakhs</h3>
        <p
          style={{
            color: currentLeader === "No one yet" ? "red" : "green",
            fontWeight: "bold",
            marginTop: "5px",
          }}
        >
          {currentLeader === "No one yet"
            ? "waiting for opening bid"
            : `Held by:${currentLeader}`}
        </p>
      </div>
      {isTeamSet && (
        <button onClick={placeBid} disabled={isWinning}>
          {isWinning ? "Bid+50L" : "Bid+50L"}
        </button>
      )}
    </div>
  );
}
export default PlayerCard;
