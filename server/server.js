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
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let GLOBAL_PLAYERS = [];

const activeGames = {};
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function startTimer(roomId) {
  const game = activeGames[roomId];
  if (!game) return;
  clearInterval(game.countdownInterval);
  game.timer = 10;
  game.isTimerRunning = true;
  io.to(roomId).emit("timer_update", game.timer);

  game.countdownInterval = setInterval(() => {
    if (game.timer > 0) {
      game.timer--;
      io.to(roomId).emit("timer_update", game.timer);
    }
    if (game.timer === 0) {
      clearInterval(game.countdownInterval);
      game.isTimerRunning = false;
      processSale(roomId);
    }
  }, 1000);
}
function processSale(roomId) {
  const game = activeGames[roomId];
  if (!game) return;
  game.isTransitioning = true;
  const winner = game.auctionState.currentLeader;
  const price = game.auctionState.currentBid;
  const justSoldPlayer = game.auctionState.currentPlayer;
  if (winner !== "No one yet" && game.teams[winner]) {
    game.teams[winner].budget -= price;

    const boughtPlayer = { ...justSoldPlayer, soldPrice: price };
    game.teams[winner].squad.push(boughtPlayer);
    io.to(roomId).emit("update_teams", game.teams); // Update everyone's wallets
  }
  io.to(roomId).emit("auction_sold", {
    winner: winner !== "No one yet" ? `${winner} (₹${price}Lakhs)` : "UNSOLD",
    player: justSoldPlayer,
  });

  setTimeout(() => {
    game.playerIndex = (game.playerIndex + 1) % GLOBAL_PLAYERS.length; // Cycle loop
    const nextPlayer = GLOBAL_PLAYERS[game.playerIndex];
    //resetting for new player
    game.auctionState = {
      currentBid: nextPlayer.basePrice || 50,
      currentLeader: "No one yet",
      currentPlayer: nextPlayer,
      lastSoldTo: null,
    };
    io.to(roomId).emit("update_auction", game.auctionState);
    game.isTransitioning = false;

    if (game.hasAuctionStarted) {
      startTimer(roomId);
    } else {
      game.timer = 10;
      game.isTimerRunning = false;
      io.to(roomId).emit("timer_update", game.timer);
    }
  }, 1000);
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Send the current bid to the NEW user immediately upon connection
  socket.on("create_room", () => {
    const roomId = generateRoomCode();
    socket.join(roomId);

    activeGames[roomId] = {
      adminSocketID: socket.id,
      gameStarted: false,
      playerIndex: 0,
      teams: {},
      timer: 10,
      countdownInterval: null,
      isTimerRunning: false,
      hasAuctionStarted: false,
      isTransitioning: false,
      auctionState: {
        currentBid: GLOBAL_PLAYERS[0].basePrice || 20,
        currentLeader: "No one yet",
        currentPlayer: GLOBAL_PLAYERS[0],
        lastSoldTo: null,
      },
    };

    socket.emit("room_created", roomId);
    socket.emit("set_admin", true);

    socket.emit("auction_status", false);

    socket.emit("update_auction", activeGames[roomId].auctionState);
    socket.emit("update_teams", activeGames[roomId].teams);
    socket.emit("timer_update", activeGames[roomId].timer);
    socket.emit("players_list", GLOBAL_PLAYERS);
  });
  socket.on("join_room", (roomId) => {
    const game = activeGames[roomId];
    if (game) {
      socket.join(roomId);
      socket.emit("room_joined", roomId);
      socket.emit("set_admin", false);
      socket.emit("update_auction", game.auctionState);
      socket.emit("update_teams", game.teams);
      socket.emit("timer_update", game.timer);
      socket.emit("auction_status", game.gameStarted);
      socket.emit("players_list", GLOBAL_PLAYERS);
    } else {
      socket.emit("error_message", "Room not found!");
    }
  });

  socket.on("join_game", (data) => {
    const { teamName, roomId } = data;
    const game = activeGames[roomId];
    if (game && !game.teams[teamName]) {
      // create new wallet if team is not present
      game.teams[teamName] = { budget: 10000, squad: [] };
      io.to(roomId).emit("update_teams", game.teams);
    }
  });

  // 2. Listen for a "place_bid" event from the frontend
  socket.on("place_bid", (data) => {
    // Logic: Increase bid by 1 crore (or whatever amount passed)
    const { amount, teamName, roomId } = data;
    const game = activeGames[roomId];
    if (!game) return;
    const teamWallet = game.teams[teamName];
    if (teamWallet && teamWallet.budget >= amount) {
      if (amount > game.auctionState.currentBid) {
        game.hasAuctionStarted = true;
        game.auctionState.currentBid = amount;
        game.auctionState.currentLeader = teamName;
        io.to(roomId).emit("update_auction", game.auctionState);
        startTimer(roomId);
      }
    }
  });
  //admin only
  socket.on("next_player", (roomId) => {
    const game = activeGames[roomId];
    if (!game || game.isTransitioning) return;
    if (socket.id !== game.adminSocketID) return;

    game.hasAuctionStarted = true;
    clearInterval(game.countdownInterval);
    game.isTimerRunning = false;
    processSale(roomId);
  });

  // NEW: Admin starts the game
  socket.on("start_auction", (roomId) => {
    const game = activeGames[roomId];
    if (!game) return;

    // Security check: Only Admin can start it
    if (socket.id !== game.adminSocketID) return;

    game.gameStarted = true;
    io.to(roomId).emit("auction_status", true); // Tell everyone in the room!
  });

  // Handle disconnects (optional cleanup logic could go here)
  socket.on("disconnect", () => {
    // You could check if an admin disconnected and assign a new one,
    // or delete empty rooms to save server memory!
    console.log(`User Disconnected: ${socket.id}`);
  });
});

async function initializeGame() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("CONNECTED TO MONGODB ATLAS!");
    GLOBAL_PLAYERS = await Player.find({}).lean();

    console.log(`Loaded all ${GLOBAL_PLAYERS.length} for the mega auction`);
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`SERVER RUNNING ON PORT ${PORT}`);
    });
  } catch (err) {
    console.log("failed to start server", err);
  }
}

initializeGame();
