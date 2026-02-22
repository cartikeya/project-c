import React from "react";

function PlayerCard({
  currentPlayer,
  currentBid,
  currentLeader,
  placeBid,
  isTeamSet,
  isWinning,
  timer,
}) {
  const playerImage = currentPlayer.img
    ? currentPlayer.img
    : `https://ui-avatars.com/api/?name=${currentPlayer.name.replace(" ", "+")}&size=250&background=random&color=fff&font-size=0.4`;
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
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-15px",
          right: "-15px",
          backgroundColor: timer <= 3 ? "#dc3545" : "#343a40",
          color: "white",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: "3px solid white",
          transition: "background-color 0.3s ease",
        }}
      >
        {timer}s
      </div>
      {/* ------------------------------------------------ */}
      <img
        src={playerImage}
        alt={currentPlayer.name}
        style={{
          width: "100%",
          height: "250px",
          objectFit: "cover",
          borderRadius: "5px",
        }}
      />
      <h2 style={{ margin: "10px 0 5px 0" }}>{currentPlayer.name}</h2>
      <p style={{ color: "#555", margin: "0" }}>
        {currentPlayer.role} | {currentPlayer.nationality || "Unknown"}
      </p>

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
