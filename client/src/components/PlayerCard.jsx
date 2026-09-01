import React, { useState } from "react";

function PlayerCard({
  currentPlayer,
  currentBid,
  currentLeader,
  placeBid,
  isTeamSet,
  isWinning,
  timer,
  isPaused,
}) {
  const [onCooldown, setOnCooldown] = useState(false);
  // 2. Wrap the original placeBid function
  const handleBidClick = () => {
    if (onCooldown || isWinning || isPaused) return;

    setOnCooldown(true); // Lock the button
    placeBid(); // Fire the actual bid to the server

    // Unlock the button after 500 milliseconds (half a second)
    setTimeout(() => {
      setOnCooldown(false);
    }, 500);
  };
  const playerImage = currentPlayer.img
    ? currentPlayer.img
    : `https://ui-avatars.com/api/?name=${currentPlayer.name.replace(" ", "+")}&size=250&background=random&color=fff&font-size=0.4`;

  const formatBid = (amountInLakhs) => {
    if (amountInLakhs >= 100) {
      return `${(amountInLakhs / 100).toFixed(2)} Cr`;
    }
    return `${amountInLakhs} L`;
  };
  const isButtonDisabled = isWinning || onCooldown || isPaused;
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
          backgroundColor: isPaused
            ? "#f39c12"
            : timer <= 3
              ? "#dc3545"
              : "#343a40",
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
        {isPaused ? "|| " : `${timer}s`}
      </div>
      {/* ------------------------------------------------ */}
      <img
        src={playerImage}
        alt={currentPlayer.name}
        style={{
          width: "100%",
          height: "250px",
          objectFit: "cover",
          filter: isPaused ? "grayscale(80%) blur(2px)" : "none",
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
        <h3 style={{ margin: "0" }}>Current Bid: {formatBid(currentBid)}</h3>
        <p
          style={{
            color: currentLeader === "No one yet" ? "red" : "green",
            fontWeight: "bold",
            marginTop: "5px",
          }}
        >
          {currentLeader === "No one yet"
            ? "Waiting for opening bid"
            : `Held by: ${currentLeader}`}
        </p>
      </div>
      {isTeamSet && (
        // <button onClick={placeBid} disabled={isWinning}>
        //   {isWinning ? "Bid+50L" : "Bid+50L"}
        // </button>
        <button
          onClick={handleBidClick}
          disabled={isButtonDisabled}
          style={{
            width: "100%",
            padding: "16px 20px",
            fontSize: "1.3rem",
            fontWeight: "bold",
            color: "white",
            // Bright green when you can bid, muted grey when you are winning
            backgroundColor: isPaused
              ? "#7f8c8d"
              : isWinning
                ? "#95a5a6"
                : onCooldown
                  ? "#2ecc71"
                  : "#27ae60",
            border: "none",
            borderRadius: "10px",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
            // Add a glowing shadow only when it's clickable
            boxShadow: isButtonDisabled
              ? "none"
              : "0 6px 12px rgba(39, 174, 96, 0.3)",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginTop: "15px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: onCooldown && !isWinning ? 0.8 : 1,
            gap: "10px",
          }}
        >
          {/* Change the text to make it feel more rewarding! */}

          {isPaused
            ? "Game Paused 🛑"
            : isWinning
              ? `Winning at ${formatBid(currentBid)}`
              : onCooldown
                ? "Bidding..."
                : `Bid ${formatBid(currentBid)}`}
        </button>
      )}
    </div>
  );
}
export default PlayerCard;
