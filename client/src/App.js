// App.js
import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import PlayerCard from "./components/PlayerCard";
import SoldOverlay from "./components/SoldOverlay";
import SquadOverview from "./components/SquadOverview";
import Lobby from "./components/Lobby";
import PlayerPool from "./components/PlayerPool";

function App() {
  const [auctionData, setAuctionData] = useState(null);
  const [teamsData, setTeamsData] = useState({});
  const [myTeamName, setMyTeamName] = useState("");
  const [isTeamSet, setIsTeamSet] = useState(false);
  const [soldInfo, setSoldInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [timer, setTimer] = useState(10);
  const [roomId, setRoomId] = useState(null);
  const [inRoom, setInRoom] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playersList, setPlayersList] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    socket.on("room_created", (id) => {
      setRoomId(id);
      setInRoom(true);
    });
    socket.on("room_joined", (id) => {
      setRoomId(id);
      setInRoom(true);
    });
    socket.on("error_message", (msg) => {
      alert(msg);
    });

    // LISTEN: The server now sends an object with bid AND leader
    socket.on("update_auction", (data) => {
      setAuctionData(data);
      setSoldInfo(null);
    });
    socket.on("update_teams", (data) => setTeamsData(data));
    socket.on("auction_sold", (data) => setSoldInfo(data));
    socket.on("set_admin", (isAdminStatus) => setIsAdmin(isAdminStatus));
    socket.on("timer_update", (time) => setTimer(time));
    socket.on("auction_status", (status) => setGameStarted(status));
    socket.on("players_list", (list) => setPlayersList(list));
    // cleanup listeners when prevents bugs when component reloads
    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("error_message");
      socket.off("update_auction");
      socket.off("update_teams");
      socket.off("auction_sold");
      socket.off("set_admin");
      socket.off("timer_update");
      socket.off("auction_status");
      socket.off("players_list");
    };
  }, []);

  const togglePause = () => {
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);

    // Tell the backend to freeze the timer!
    socket.emit("toggle_pause", { roomId, isPaused: newPauseState });
  };
  const handleSetTeam = () => setIsTeamSet(true);
  const placeBid = () => {
    if (!isTeamSet || !auctionData || !roomId) return;
    const myWallet = teamsData[myTeamName]?.budget || 0;
    const nextBid = auctionData.currentBid + 50;

    if (nextBid > myWallet) {
      return alert(`not enough money! you only have ${myWallet}`);
    }
    socket.emit("place_bid", {
      amount: nextBid,
      teamName: myTeamName,
      roomId: roomId,
    });
  };

  const nextPlayer = () => socket.emit("next_player", roomId);

  const startGame = () => {
    socket.emit("start_auction", roomId);
  };

  if (!inRoom) {
    return <Lobby />;
  }

  if (!auctionData || !auctionData.currentPlayer) {
    return (
      <div
        style={{ textAlign: "center", marginTop: "50px", fontSize: "1.5rem" }}
      >
        ⏳ Loading Mega Auction Database...
      </div>
    );
  }

  // const { currentPlayer, currentBid, currentLeader } = auctionData;

  const isWinning = auctionData.currentLeader === myTeamName;
  const takenTeamNames = Object.keys(teamsData);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>IPL Auction</h1>
        <div
          style={{
            background: "#ffeb3b",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            border: "2px solid #ccc",
          }}
        >
          Room Code:
          <span
            style={{
              fontSize: "1.5rem",
              letterSpacing: "2px",
              color: "#d32f2f",
            }}
          >
            {roomId}
          </span>
        </div>
      </div>
      {/* team name section */}

      {!isTeamSet ? (
        <Login
          setMyTeamName={setMyTeamName}
          handleSetTeam={handleSetTeam}
          takenTeamNames={takenTeamNames}
          roomId={roomId}
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
      {isTeamSet && !gameStarted && (
        // WAITING LOBBY
        <div
          style={{
            marginTop: "40px",
            padding: "30px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "2px dashed #ccc",
          }}
        >
          <h2>⏳ Waiting for players to join...</h2>
          <p>
            Current players in room: <strong>{takenTeamNames.length}</strong>
          </p>

          {isAdmin ? (
            <button
              onClick={startGame}
              style={{
                padding: "15px 30px",
                fontSize: "1.2rem",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              🚀 Start Auction Now
            </button>
          ) : (
            <p
              style={{ color: "#777", fontStyle: "italic", marginTop: "20px" }}
            >
              Waiting for Admin to start the game...
            </p>
          )}

          {/* Show who has joined so far */}
          <div style={{ marginTop: "30px" }}>
            <SquadOverview teamsData={teamsData} />
          </div>
          {/* Add the Pool here too so they can strategize! */}
          <div style={{ marginTop: "30px" }}>
            <PlayerPool playersList={playersList} currentPlayer={null} />
          </div>
        </div>
      )}
      {isTeamSet && gameStarted && (
        <>
          <PlayerCard
            currentPlayer={auctionData.currentPlayer}
            currentBid={auctionData.currentBid}
            currentLeader={auctionData.currentLeader}
            placeBid={placeBid}
            isTeamSet={isTeamSet}
            isWinning={isWinning}
            timer={timer}
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
              <AdminPanel
                nextPlayer={nextPlayer}
                socket={socket}
                roomId={roomId}
                isPaused={isPaused}
                togglePause={togglePause}
              />
            </div>
          )}

          <SquadOverview teamsData={teamsData} />
          <PlayerPool
            playersList={playersList}
            currentPlayer={auctionData.currentPlayer}
          />
        </>
      )}
    </div>
  );
}

export default App;
