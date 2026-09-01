import React from "react";

function SoldOverlay({ auctionData }) {
  const { lastSoldTo, currentPlayer } = auctionData;

  // Helper function to format the final sold price
  const formatPrice = (amount) => {
    // Parse to a number just in case it's passed as a string
    const num = Number(amount);

    // Fallback: If it's text (like a team name), just return the text
    if (isNaN(num)) return amount;

    // Convert to Crores if 100 Lakhs or more
    if (num >= 100) {
      return `${(num / 100).toFixed(2)} Cr`;
    }
    return `${num} L`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.85)", // Dark background
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {/* <img
          src={currentPlayer.img}
          alt="Player"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "5px solid white",
          }}
        /> */}
        <h2 style={{ fontSize: "3rem", margin: "10px 0" }}>
          {currentPlayer.name}
        </h2>

        {/* The updated formatted output! */}
        <h3 style={{ fontSize: "2rem", color: "#28a745" }}>
          {formatPrice(lastSoldTo)}
        </h3>
        
      </div>
    </div>
  );
}

export default SoldOverlay;
