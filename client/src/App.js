// App.js
import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import PlayerCard from "./components/PlayerCard";

function App() {
  const [auctionData, setAuctionData] = useState(null);
  const [myTeamName, setMyTeamName] = useState("");
  const [isTeamSet, setIsTeamSet] = useState(false);
  useEffect(() => {
    // LISTEN: The server now sends an object with bid AND leader
    socket.on("update_auction", (data) => {
      setAuctionData(data);
    });
    // cleanup listeners when prevents bugs when component reloads
    return () => socket.off("update_auction");
  }, []);

  const handleSetTeam = () => {
    if (myTeamName.trim() == "") {
      alert("enter your team name??");
      return;
    }
    setIsTeamSet(true);
  };

  const placeBid = () => {
    if (!myTeamName || !auctionData) return;
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

  // const { currentPlayer, currentBid, currentLeader } = auctionData;

  const isWinning = auctionData.currentLeader === myTeamName;

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial", padding: "20px" }}>
      <h1>🏏 IPL Mock Auction</h1>
      {/* team name section */}

      {!isTeamSet ? (
        <Login
          myTeamName={myTeamName}
          setMyTeamName={setMyTeamName}
          handleSetTeam={handleSetTeam}
        />
      ) : (
        <h1>
          Playing as :<span style={{ color: "#007bff" }}>{myTeamName}</span>
        </h1>
      )}
      <hr style={{ margin: "20px auto", width: "50%" }} />

      <PlayerCard
        currentPlayer={auctionData.currentPlayer}
        currentBid={auctionData.currentBid}
        currentLeader={auctionData.currentLeader}
        placeBid={placeBid}
        isTeamSet={isTeamSet}
        isWinning={isWinning}
      />

      <AdminPanel nextPlayer={nextPlayer} />
    </div>
  );
}

export default App;
