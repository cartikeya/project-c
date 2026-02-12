// App.js
import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import PlayerCard from "./components/PlayerCard";
import SoldOverlay from "./components/SoldOverlay";

function App() {
  const [auctionData, setAuctionData] = useState(null);
  const [teamsData, setTeamsData] = useState({});
  const [myTeamName, setMyTeamName] = useState("");
  const [isTeamSet, setIsTeamSet] = useState(false);

  const [soldInfo, setSoldInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    // LISTEN: The server now sends an object with bid AND leader
    socket.on("update_auction", (data) => {
      setAuctionData(data);
      setSoldInfo(null);
    });
    socket.on("update_teams", (data) => setTeamsData(data));

    socket.on("auction_sold", (data) => setSoldInfo(data));
    socket.on("set_admin", (isAdminStatus) => setIsAdmin(isAdminStatus));
    // cleanup listeners when prevents bugs when component reloads
    return () => {
      socket.off("update_auction");
      socket.off("update_teams");
      socket.off("auction_sold");
      socket.off("set_admin");
    };
  }, []);

  const handleSetTeam = () => setIsTeamSet(true);
  const placeBid = () => {
    if (!myTeamName || !auctionData) return;
    const myWallet = teamsData[myTeamName]?.budget || 0;
    const nextBid = auctionData.currentBid + 50;

    if (nextBid > myWallet) {
      return alert(`not enough money! you only have ${myWallet}`);
    }
    socket.emit("place_bid", { amount: nextBid, teamName: myTeamName });
  };

  const nextPlayer = () => {
    //in real app only admin should see the button
    socket.emit("next_player");
  };

  if (!auctionData) return <div>Loading please wait...</div>;

  // const { currentPlayer, currentBid, currentLeader } = auctionData;

  const isWinning = auctionData.currentLeader === myTeamName;

  const myStats = teamsData[myTeamName] || { budget: 10000, squad: [] };

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial", padding: "20px" }}>
      {soldInfo && (
        <SoldOverlay
          auctionData={{
            lastSoldTo: soldInfo.winner,
            currentPlayer: soldInfo.player,
          }}
        />
      )}
      <h1>IPL Auction</h1>
      {/* team name section */}

      {!isTeamSet ? (
        <Login
          myTeamName={myTeamName}
          setMyTeamName={setMyTeamName}
          handleSetTeam={handleSetTeam}
        />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 20px",
            background: "#333",
            color: "white",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>Team: {myTeamName}</h3>
          <h3>Purse: {myStats.budget / 100.0} Crores</h3>
          <h3>Players: {myStats.squad.length}</h3>
        </div>
      )}

      {auctionData.lastSoldTo && (
        <div
          style={{
            background: "#ffeb3b",
            padding: "10px",
            margin: "10px auto",
            maxWidth: "400px",
            borderRadius: "5px",
          }}
        >
          last Sold:{" "}
          <strong>
            {" "}
            {/* {auctionData.currentPlayer.name} */}
            {auctionData.lastSoldTo}
            {console.log(auctionData)}
          </strong>
        </div>
      )}
      <br />
      <PlayerCard
        currentPlayer={auctionData.currentPlayer}
        currentBid={auctionData.currentBid}
        currentLeader={auctionData.currentLeader}
        placeBid={placeBid}
        isTeamSet={isTeamSet}
        isWinning={isWinning}
      />

      {isAdmin && (
        <div
          style={{
            border: "2px dashed red",
            padding: "10px",
            marginTop: "20px",
          }}
        >
          <h4 style={{ margin: "5px", color: "red" }}>Admin Controls:</h4>
          <AdminPanel nextPlayer={nextPlayer} />
        </div>
      )}

      {isTeamSet && myStats.squad.length > 0 && (
        <div>
          <h3>My squad:</h3>
          <ul>
            {myStats.squad.map((p, idx) => (
              <li key={idx}>
                {p.name} ({p.role})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
