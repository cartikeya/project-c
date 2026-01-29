// App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001");

function App() {
  const [auctionData, setAuctionData] = useState(null);
  const [myTeamName, setMyTeamName] = useState("");

  const [isTeamSet, setIsTeamSet] = useState(false);

  useEffect(() => {
    // LISTEN: The server now sends an object with bid AND leader
    socket.on("update_auction", (data) => {
      setAuctionData(data);
    });
  }, []);

  const handleSetTeam = () => {
    if (myTeamName.trim() == "") {
      alert("enter your team name??");
      return;
    }
    setIsTeamSet(true);
  };

  const placeBid = () => {
    if (!myTeamName) return;
    if (!auctionData) return;
    if (auctionData.currentLeader === myTeamName) {
      console.log("you are the highest bidder");
      return;
    }

    // SEND: We now send our name along with the money
    const newBidAmount = auctionData.currentBid + 50;
    socket.emit("place_bid", { amount: newBidAmount, teamName: myTeamName });
  };

  const nextPlayer = () => {
    //in real app only admin should see the button
    socket.emit("next_player");
  };

  if (!auctionData) return <div>Loading auction please wait...</div>;
  console.log(auctionData);

  const { currentPlayer, currentBid, currentLeader } = auctionData;

  const isWinning = currentLeader === myTeamName;

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial", padding: "20px" }}>
      <h1>🏏 IPL Mock Auction</h1>
      {/* team name section */}
      <div style={{ marginBottom: "20px" }}>
        {!isTeamSet ? (
          <div>
            <input
              type="text"
              placeholder="Your Team Name"
              value={myTeamName}
              onChange={(e) => setMyTeamName(e.target.value)}
              style={{ padding: "8px", marginBottom: "20px" }}
            />
            <button onClick={handleSetTeam}>join auction</button>
          </div>
        ) : (
          <h1>
            Playing as :<span style={{ color: "#007bff" }}>{myTeamName}</span>
          </h1>
        )}
      </div>

      {/* --- PLAYER CARD --- */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "400px",
          margin: "0 auto",
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
        <h2>{currentPlayer.name}</h2>
        <p style={{ color: "#555" }}>Role: {currentPlayer.role}</p>

        <hr />

        <h3>Current Bid: ₹ {currentBid} Lakhs</h3>
        <p
          style={{
            color: currentLeader === "No one yet" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {currentLeader === "No one yet"
            ? "Waiting for opening bid..."
            : `Held by: ${currentLeader}`}
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {isTeamSet && (
            <button
              onClick={placeBid}
              disabled={isWinning} // THIS DISABLES THE BUTTON
              style={{
                width: "100%",
                padding: "15px",
                // Change color: Grey if winning, Green if losing
                background: isWinning ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "1.2rem",
                cursor: isWinning ? "not-allowed" : "pointer",
                transition: "0.3s",
              }}
            >
              {isWinning ? "You cant bid now" : "Bid +50L ✋"}
            </button>
          )}
        </div>
      </div>

      <br />

      {/* ADMIN CONTROL (Visible to everyone for now) */}
      <button
        onClick={nextPlayer}
        style={{
          padding: "10px 20px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Sold! Next Player ⏭️
      </button>
    </div>
  );
}

export default App;
