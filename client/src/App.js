// App.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Connect to backend
const socket = io.connect("http://localhost:3001");

function App() {
  const [currentBid, setCurrentBid] = useState(0);
  const [currentLeader, setCurrentLeader] = useState("No one yet");
  const [myTeamName, setMyTeamName] = useState("");

  useEffect(() => {
    // LISTEN: Wait for server to send 'receive_bid' event
    socket.on("update_auction", (data) => {
      setCurrentBid(data.currentBid);
      setCurrentLeader(data.currentLeader);
    });
  }, []);

  const placeBid = () => {
    if (myTeamName === "") {
      alert("enter your team name to continue???");
      return;
    }
    // EMIT: Send a message to server that we want to bid higher
    const newBidAmount = currentBid + 50; // Increment by 50L
    socket.emit("place_bid", { amount: newBidAmount, teamName: myTeamName });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🏏 IPL Mock Auction</h1>
      <div style={{marginBottom:"20px"}}>
        <input
          type="text"
          placeholder="enter your team name??"
          value={myTeamName}
          onChange={(e)=>{setMyTeamName(e.target.value)}}
          style={{padding:"10px",fontSize:"1rem"}}
        ></input>
      </div>

      <div style={{ fontSize: "3rem", fontWeight: "bold", margin: "20px" }}>
        Current Bid: ₹ {currentBid} Lakhs
      </div>
      <p style={{ fontSize: "1.2rem", color: "green" }}>
            Held by: <strong>{currentLeader}</strong>
        </p>

      <button
        onClick={placeBid}
        style={{ padding: "15px 30px", fontSize: "1.2rem", cursor: "pointer" }}
      >
        Raise Paddle (+50L) ✋
      </button>
    </div>
  );
}

export default App;
