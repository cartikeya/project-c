// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { PLAYERS } = require("./data");
const app = express();
app.use(cors());
const server = http.createServer(app);
// Allow React (running on localhost:3000) to connect to this server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
let playerIndex = 0;
// STATE: In a real app, this goes in a Database (MongoDB/SQL)
let auctionState = {
  currentBid: PLAYERS[0].basePrice,
  currentLeader: "No one yet",
  currentPlayer: PLAYERS[0],
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  // 1. Send the current bid to the NEW user immediately upon connection
  socket.emit("update_auction", auctionState);
  // 2. Listen for a "place_bid" event from the frontend
  socket.on("place_bid", (data) => {
    // Logic: Increase bid by 1 crore (or whatever amount passed)
    const { amount, teamName } = data;
    // Simple validation: Bid must be higher than current
    if (amount > auctionState.currentBid) {
      auctionState.currentBid = amount;
      auctionState.currentLeader = teamName;
      // BROADCAST: Tell EVERYONE (including the sender) the new price
      io.emit("update_auction", auctionState);
    }
  });

  socket.on("next_player", () => {
    playerIndex = (playerIndex + 1) % PLAYERS.length; // Cycle loop
    const nextPlayer = PLAYERS[playerIndex];
    //resetting for new player
    auctionState = {
      currentBid: nextPlayer.basePrice,
      currentLeader: "No one yet",
      currentPlayer: nextPlayer,
    };
    io.emit("update_auction", auctionState);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
