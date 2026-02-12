import React from "react";

function SoldOverlay({ auctionData }) {
  const { lastSoldTo, currentPlayer } = auctionData;
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
      <h1
        style={{
          fontSize: "5rem",
          margin: 0,
          color: "#ffeb3b",
          textShadow: "0 0 20px red",
        }}
      >
        SOLD!
      </h1>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <img
          src={currentPlayer.img}
          alt="Player"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "5px solid white",
          }}
        />
        <h2 style={{ fontSize: "3rem", margin: "10px 0" }}>
          {currentPlayer.name}
        </h2>
        <h3 style={{ fontSize: "2rem", color: "#28a745" }}>{lastSoldTo}</h3>
      </div>
    </div>
  );
}
export default SoldOverlay;
