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
let teams = {};

const INITIAL_BUDHGET = 10000; //100 cr in lakhs

// STATE: In a real app, this goes in a Database (MongoDB/SQL)
let auctionState = {
  currentBid: PLAYERS[0].basePrice,
  currentLeader: "No one yet",
  currentPlayer: PLAYERS[0],
  lastSoldTo: null, // Optional: to show "Sold to MI for 500" message
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  // 1. Send the current bid to the NEW user immediately upon connection
  socket.emit("update_auction", auctionState);
  socket.emit("update_teams", teams);

  socket.on("join_game", (teamName) => {
    if (!teams[teamName]) {
      // create new wallet if team is not present
      teams[teamName] = { budget: INITIAL_BUDHGET, squad: [] };
    }
    io.emit("update_teams", teams);
  });

  // 2. Listen for a "place_bid" event from the frontend
  socket.on("place_bid", (data) => {
    // Logic: Increase bid by 1 crore (or whatever amount passed)
    const { amount, teamName } = data;
    const teamWallet = teams[teamName];

    if (teamWallet && teamWallet.budget >= amount) {
      if (amount > auctionState.currentBid) {
        auctionState.currentBid = amount;
        auctionState.currentLeader = teamName;
        io.emit("update_auction", auctionState);
      }
    }
  });

  socket.on("next_player", () => {
    const winner = auctionState.currentLeader;
    const price = auctionState.currentBid;
    const player = auctionState.currentPlayer;

    if (winner !== "No one yet" && teams[winner]) {
      // DEDUCT MONEY
      teams[winner].budget -= price;
      // ADD PLAYER TO SQUAD
      teams[winner].squad.push(player);

      io.emit("update_teams", teams); // Update everyone's wallets
    }

    playerIndex = (playerIndex + 1) % PLAYERS.length; // Cycle loop
    const nextPlayer = PLAYERS[playerIndex];
    //resetting for new player
    auctionState = {
      currentBid: nextPlayer.basePrice,
      currentLeader: "No one yet",
      currentPlayer: nextPlayer,
      lastSoldTo: winner !== "No one yet" ? `${winner} (₹${price}L)` : "Unsold",
    };
    io.emit("update_auction", auctionState);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
