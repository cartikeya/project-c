// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Player = require("./models/Player");
const { mongo, default: mongoose } = require("mongoose");
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
let PLAYERS = [];
let playerIndex = 0;
let teams = {};
const INITIAL_BUDHGET = 10000; //100 cr in lakhs

let auctionState = {
  currentBid: 0,
  currentLeader: "No one yet",
  currentPlayer: null,
  lastSoldTo: null, // Optional: to show "Sold to MI for 500" message
};

let timer = 10;
let countdownInterval = null;
let isTimerRunning = false;
let hasAuctionStarted = false;
let isTransitioning = false;

function startTimer() {
  clearInterval(countdownInterval);
  timer = 10;
  isTimerRunning = true;
  io.emit("timer_update", timer);

  countdownInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      io.emit("timer_update", timer);
    }
    if (timer === 0) {
      clearInterval(countdownInterval);
      isTimerRunning = false;
      processSale();
    }
  }, 1000);
}

function processSale() {
  isTransitioning = true;
  const winner = auctionState.currentLeader;
  const price = auctionState.currentBid;
  const justSoldPlayer = auctionState.currentPlayer;
  if (winner !== "No one yet" && teams[winner]) {
    teams[winner].budget -= price;
    teams[winner].squad.push(justSoldPlayer);
    io.emit("update_teams", teams); // Update everyone's wallets
  }
  io.emit("auction_sold", {
    winner: winner !== "No one yet" ? `${winner} (₹${price}Lakhs)` : "UNSOLD",
    player: justSoldPlayer,
  });

  setTimeout(() => {
    playerIndex = (playerIndex + 1) % PLAYERS.length; // Cycle loop
    const nextPlayer = PLAYERS[playerIndex];
    //resetting for new player
    auctionState = {
      currentBid: nextPlayer.basePrice || 50,
      currentLeader: "No one yet",
      currentPlayer: nextPlayer,
      lastSoldTo: null,
    };
    io.emit("update_auction", auctionState);
    isTransitioning = false;

    if (hasAuctionStarted) {
      startTimer();
    } else {
      timer = 10;
      isTimerRunning = false;
      io.emit("timer_update", timer);
    }
  }, 5000);
}

let adminSocketID = null; //tracking admin id

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  // assign admin
  if (!adminSocketID) {
    adminSocketID = socket.id;
    socket.emit("set_admin", true);
  } else {
    socket.emit("set_admin", false);
  }

  // 1. Send the current bid to the NEW user immediately upon connection
  socket.emit("update_auction", auctionState);
  socket.emit("update_teams", teams);
  socket.emit("timer_update", timer);
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
        hasAuctionStarted = true;
        auctionState.currentBid = amount;
        auctionState.currentLeader = teamName;
        io.emit("update_auction", auctionState);
        startTimer();
      }
    }
  });

  socket.on("next_player", () => {
    if (isTransitioning) {
      console.log("Admin clicked next, but we are already transitioning.");
      return;
    }
    hasAuctionStarted = true;
    clearInterval(countdownInterval);
    isTimerRunning = false;
    processSale();
  });

  // if admin leaves select next admin
  socket.on("disconnect", () => {
    if (socket.id == adminSocketID) {
      adminSocketID = null;
      // In a real app, you'd pick the next connected socket here.
      // For now, the next person to refresh/connect will become admin.
    }
  });
});

async function initializeGame() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("CONNECTED TO MONGODB ATLAS!");
    PLAYERS = await Player.find({});

    console.log(`Loaded all ${PLAYERS.length} for the mega auction`);
    auctionState.currentPlayer = PLAYERS[0];
    auctionState.currentBid = PLAYERS[0].basePrice || 20;
    server.listen(3001, () => {
      console.log("SERVER RUNNING ON PORT 3001");
    });
  } catch (err) {
    console.log("failed to start server", err);
  }
}

initializeGame();
