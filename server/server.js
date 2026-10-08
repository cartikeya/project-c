require("dotenv").config();
const { randomInt } = require("crypto");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const mongoose = require("mongoose");
const Player = require("./models/Player");
const User = require("./models/User");
const AuctionRoom = require("./models/AuctionRoom");

const app = express();
const server = http.createServer(app);
const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin = configuredOrigins.length ? configuredOrigins : "*";
const corsOptions = { origin: corsOrigin, methods: ["GET", "POST"] };
const googleClient = new OAuth2Client();
const tokenIssuer = "project-c-auction";

app.use(cors(corsOptions));
app.use(express.json({ limit: "32kb" }));

const io = new Server(server, { cors: corsOptions });
let GLOBAL_PLAYERS = [];
const activeGames = Object.create(null);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "671625674339-atieils13ucn4icst5r2dgk05f0musmg.apps.googleusercontent.com";
const TEAM_NAMES = new Set(["CSK", "MI", "RCB", "SRH", "RR", "PBKS", "KKR", "DC", "GT", "LSG"]);
const ROOM_JOIN_WINDOW_MS = 60_000;
const ROOM_JOIN_LIMIT = 10;
const roomJoinAttempts = new Map();

function generateRoomCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

function consumeRoomJoinAttempt(key) {
  const now = Date.now();
  let attempts = roomJoinAttempts.get(key);
  if (!attempts || now - attempts.startedAt >= ROOM_JOIN_WINDOW_MS) {
    attempts = { startedAt: now, count: 0 };
    roomJoinAttempts.set(key, attempts);
  }
  if (attempts.count >= ROOM_JOIN_LIMIT) return false;
  attempts.count += 1;

  if (roomJoinAttempts.size > 1000) {
    for (const [attemptKey, bucket] of roomJoinAttempts) {
      if (now - bucket.startedAt >= ROOM_JOIN_WINDOW_MS) roomJoinAttempts.delete(attemptKey);
    }
  }
  return true;
}

function isRoomAdmin(socket, game, roomId) {
  if (!game || !socket.rooms.has(roomId)) return false;
  if (game.adminUserId) return Boolean(socket.userId && String(game.adminUserId) === socket.userId);
  return game.adminSocketID === socket.id;
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    picture: user.picture || "",
    activeRoomId: user.activeRoomId || null,
    activeTeamName: user.activeTeamName || null,
  };
}

function issueSessionToken(user) {
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    expiresIn: "12h",
    issuer: tokenIssuer,
  });
}

function readBearerToken(header) {
  if (typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(email) {
  const exactMatch = await User.findOne({ email });
  if (exactMatch) return exactMatch;
  return User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });
}

function verifySessionToken(token) {
  if (!process.env.JWT_SECRET) throw new Error("Session signing is not configured.");
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const userId = payload.sub || payload.id;
  if (!userId || !mongoose.isValidObjectId(userId)) throw new Error("Invalid session subject.");
  return { ...payload, sub: String(userId) };
}

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// Keep the deployed main-branch email/password API alongside Google sign-in.
app.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!name || !email || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required." });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const user = await findUserByEmail(email);
    if (!user?.password || !password || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      return res.status(503).json({ message: "Google sign-in is not configured on the server yet." });
    }
    const credential = req.body?.credential;
    if (typeof credential !== "string" || credential.length > 10000) {
      return res.status(400).json({ message: "A valid Google credential is required." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile.email || profile.email_verified !== true) {
      return res.status(401).json({ message: "Google could not verify this account." });
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ googleId: profile.sub });
    if (!user) user = await findUserByEmail(email);
    if (user) {
      user.googleId = profile.sub;
      user.email = email;
      user.name = profile.name || user.name || email.split("@")[0];
      user.picture = profile.picture || user.picture || "";
      await user.save();
    } else {
      user = await User.create({
        googleId: profile.sub,
        email,
        name: profile.name || email.split("@")[0],
        picture: profile.picture || "",
      });
    }

    return res.status(200).json({ token: issueSessionToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Google sign-in failed:", error.message);
    return res.status(401).json({ message: "Google sign-in could not be verified. Please try again." });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const token = readBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: "Sign-in required." });
    const payload = verifySessionToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Account not found. Please sign in again." });
    return res.status(200).json({ user: publicUser(user) });
  } catch (_error) {
    return res.status(401).json({ message: "Your sign-in has expired. Please sign in again." });
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    // Preserve the currently deployed anonymous flow; signed-in clients send
    // a token and receive account-backed room recovery.
    if (!token) {
      socket.userId = null;
      return next();
    }
    const payload = verifySessionToken(token);
    socket.userId = String(payload.sub);
    return next();
  } catch (_error) {
    return next(new Error("Your sign-in has expired. Please sign in again."));
  }
});

function persistInBackground(roomId) {
  persistGame(roomId).catch((error) => {
    console.error(`Could not save auction room ${roomId}:`, error.message);
  });
}

async function persistGame(roomId) {
  const game = activeGames[roomId];
  // Legacy anonymous rooms retain their prior in-memory behavior.
  if (!game || !game.adminUserId) return;
  await AuctionRoom.updateOne(
    { roomId },
    {
      $set: {
        roomId,
        adminUserId: game.adminUserId,
        teams: game.teams,
        auctionState: game.auctionState,
        playerIndex: game.playerIndex,
        gameStarted: game.gameStarted,
        hasAuctionStarted: game.hasAuctionStarted,
        isPaused: game.isPaused,
        timer: game.timer,
        timerEndsAt: game.timerEndsAt ? new Date(game.timerEndsAt) : null,
      },
    },
    { upsert: true, runValidators: true },
  ).exec();
}

function freezeTimer(game) {
  if (game.countdownInterval) clearInterval(game.countdownInterval);
  game.countdownInterval = null;
  if (game.timerEndsAt) {
    game.timer = Math.max(0, Math.ceil((game.timerEndsAt - Date.now()) / 1000));
  }
  game.timerEndsAt = null;
  game.isTimerRunning = false;
}

function startTimer(roomId, resetTimer = true) {
  const game = activeGames[roomId];
  if (!game || game.isPaused) return;
  if (game.countdownInterval) clearInterval(game.countdownInterval);
  if (resetTimer) game.timer = 10;
  if (game.timer <= 0) return;

  game.timerEndsAt = Date.now() + game.timer * 1000;
  game.isTimerRunning = true;
  io.to(roomId).emit("timer_update", game.timer);
  persistInBackground(roomId);

  game.countdownInterval = setInterval(() => {
    if (game.isPaused) {
      freezeTimer(game);
      return;
    }
    const remaining = Math.max(0, Math.ceil((game.timerEndsAt - Date.now()) / 1000));
    if (remaining !== game.timer) {
      game.timer = remaining;
      io.to(roomId).emit("timer_update", game.timer);
    }
    if (remaining === 0) {
      freezeTimer(game);
      persistInBackground(roomId);
      processSale(roomId);
    }
  }, 250);
}

function processSale(roomId) {
  const game = activeGames[roomId];
  if (!game || game.isTransitioning || !GLOBAL_PLAYERS.length) return;
  freezeTimer(game);
  game.isTransitioning = true;

  const winner = game.auctionState.currentLeader;
  const price = game.auctionState.currentBid;
  const justSoldPlayer = game.auctionState.currentPlayer;
  if (winner !== "No one yet" && game.teams[winner]) {
    game.teams[winner].budget -= price;
    game.teams[winner].squad.push({ ...justSoldPlayer, soldPrice: price });
    io.to(roomId).emit("update_teams", game.teams);
  }
  persistInBackground(roomId);
  io.to(roomId).emit("auction_sold", {
    winner: winner !== "No one yet" ? `${winner} (₹${price}Lakhs)` : "UNSOLD",
    player: justSoldPlayer,
  });

  setTimeout(() => {
    const nextPlayerIndex = (game.playerIndex + 1) % GLOBAL_PLAYERS.length;
    game.playerIndex = nextPlayerIndex;
    const nextPlayer = GLOBAL_PLAYERS[nextPlayerIndex];
    game.auctionState = {
      currentBid: nextPlayer.basePrice || 50,
      currentLeader: "No one yet",
      currentPlayer: nextPlayer,
      lastSoldTo: null,
    };
    game.timer = 10;
    game.timerEndsAt = null;
    game.isTimerRunning = false;
    game.isTransitioning = false;
    io.to(roomId).emit("update_auction", game.auctionState);

    if (game.hasAuctionStarted && !game.isPaused) {
      startTimer(roomId);
    } else {
      io.to(roomId).emit("timer_update", game.timer);
      persistInBackground(roomId);
    }
  }, 1000);
}

function findTeamForUser(game, userId) {
  if (!userId) return null;
  return Object.entries(game.teams).find(([, team]) => String(team.userId) === String(userId))?.[0] || null;
}

function emitRoomState(socket, roomId, game, isAdmin, teamName) {
  socket.emit("room_joined", roomId);
  socket.emit("set_admin", isAdmin);
  socket.emit("update_auction", game.auctionState);
  socket.emit("update_teams", game.teams);
  socket.emit("timer_update", game.timer);
  socket.emit("auction_status", game.gameStarted);
  socket.emit("pause_status", game.isPaused);
  socket.emit("players_list", GLOBAL_PLAYERS);
  socket.emit("session_restored", { roomId, teamName, isAdmin });
}

function hydrateGame(record) {
  const now = Date.now();
  let timer = Number(record.timer ?? 10);
  const timerEndsAt = record.timerEndsAt ? new Date(record.timerEndsAt).getTime() : null;
  if (!record.isPaused && record.hasAuctionStarted && timerEndsAt) {
    timer = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
  }
  return {
    adminUserId: record.adminUserId ? String(record.adminUserId) : null,
    adminSocketID: null,
    gameStarted: Boolean(record.gameStarted),
    playerIndex: Number(record.playerIndex || 0),
    teams: record.teams || {},
    timer,
    timerEndsAt,
    countdownInterval: null,
    isTimerRunning: false,
    hasAuctionStarted: Boolean(record.hasAuctionStarted),
    isTransitioning: false,
    isPaused: Boolean(record.isPaused),
    auctionState: record.auctionState,
  };
}

async function loadGame(roomId) {
  if (activeGames[roomId]) return activeGames[roomId];
  const record = await AuctionRoom.findOne({ roomId }).lean();
  if (!record) return null;
  const game = hydrateGame(record);
  activeGames[roomId] = game;
  if (game.hasAuctionStarted && !game.isPaused) {
    if (game.timer <= 0) {
      game.timer = 0;
      game.timerEndsAt = null;
      persistInBackground(roomId);
      setImmediate(() => processSale(roomId));
    } else {
      startTimer(roomId, false);
    }
  }
  return game;
}

function emitConnectionError(socket, error, message) {
  console.error(message, error.message);
  socket.emit("error_message", "Something went wrong. Please retry.");
}

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.userId || "legacy anonymous client"}`);

  socket.on("restore_session", async () => {
    try {
      if (!socket.userId) {
        socket.emit("session_not_found");
        return;
      }
      const user = await User.findById(socket.userId);
      if (!user?.activeRoomId) {
        socket.emit("session_not_found");
        return;
      }
      const roomId = user.activeRoomId;
      const game = await loadGame(roomId);
      if (!game) {
        await User.findByIdAndUpdate(socket.userId, { $set: { activeRoomId: null, activeTeamName: null } });
        socket.emit("session_not_found");
        return;
      }

      const isAdmin = String(game.adminUserId) === socket.userId;
      const teamName = findTeamForUser(game, socket.userId);
      socket.join(roomId);
      emitRoomState(socket, roomId, game, isAdmin, teamName);
    } catch (error) {
      emitConnectionError(socket, error, "Could not restore auction session:");
    }
  });

  socket.on("create_room", async () => {
    try {
      if (!GLOBAL_PLAYERS.length) {
        socket.emit("error_message", "The player list is unavailable. Please try again later.");
        return;
      }
      let roomId = generateRoomCode();
      while (activeGames[roomId] || (await AuctionRoom.exists({ roomId }))) roomId = generateRoomCode();

      const initialPlayer = GLOBAL_PLAYERS[0];
      activeGames[roomId] = {
        adminUserId: socket.userId,
        adminSocketID: socket.id,
        gameStarted: false,
        playerIndex: 0,
        teams: {},
        timer: 10,
        timerEndsAt: null,
        countdownInterval: null,
        isTimerRunning: false,
        hasAuctionStarted: false,
        isTransitioning: false,
        isPaused: false,
        auctionState: {
          currentBid: initialPlayer.basePrice || 20,
          currentLeader: "No one yet",
          currentPlayer: initialPlayer,
          lastSoldTo: null,
        },
      };

      await persistGame(roomId);
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { $set: { activeRoomId: roomId, activeTeamName: null } });
      }
      socket.join(roomId);
      socket.emit("room_created", roomId);
      socket.emit("set_admin", true);
      socket.emit("auction_status", false);
      socket.emit("pause_status", false);
      socket.emit("update_auction", activeGames[roomId].auctionState);
      socket.emit("update_teams", activeGames[roomId].teams);
      socket.emit("timer_update", activeGames[roomId].timer);
      socket.emit("players_list", GLOBAL_PLAYERS);
    } catch (error) {
      emitConnectionError(socket, error, "Could not create auction room:");
    }
  });

  socket.on("join_room", async (requestedRoomId) => {
    try {
      const attemptKey = `${socket.userId || socket.id}:${socket.handshake.address || "unknown"}`;
      if (!consumeRoomJoinAttempt(attemptKey)) {
        socket.emit("error_message", "Too many room-code attempts. Wait one minute, then try again.");
        return;
      }
      const roomId = String(requestedRoomId || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{4}$/.test(roomId)) {
        socket.emit("error_message", "Enter a valid four-character room code.");
        return;
      }
      const game = await loadGame(roomId);
      if (!game) {
        socket.emit("error_message", "Room not found!");
        return;
      }
      if (game.adminUserId && !socket.userId) {
        socket.emit("error_message", "Sign in before joining this saved auction room.");
        return;
      }

      const isAdmin = game.adminUserId
        ? String(game.adminUserId) === socket.userId
        : game.adminSocketID === socket.id;
      const teamName = findTeamForUser(game, socket.userId);
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { $set: { activeRoomId: roomId, activeTeamName: teamName } });
      }
      socket.join(roomId);
      roomJoinAttempts.delete(attemptKey);
      emitRoomState(socket, roomId, game, isAdmin, teamName);
    } catch (error) {
      emitConnectionError(socket, error, "Could not join auction room:");
    }
  });

  socket.on("join_game", async (data = {}, acknowledge) => {
    const respond = (payload) => {
      if (typeof acknowledge === "function") acknowledge(payload);
    };
    try {
      const teamName = String(data.teamName || "").trim();
      const roomId = String(data.roomId || "").trim().toUpperCase();
      const game = await loadGame(roomId);
      if (!game || !socket.rooms.has(roomId)) {
        respond({ ok: false, message: "Join a valid room before choosing a franchise." });
        return;
      }
      if (game.adminUserId && !socket.userId) {
        respond({ ok: false, message: "Sign in before joining this saved auction room." });
        return;
      }
      if (!TEAM_NAMES.has(teamName)) {
        respond({ ok: false, message: "Choose one of the available franchises." });
        return;
      }

      const ownerId = socket.userId || socket.id;
      const currentUserTeam = findTeamForUser(game, ownerId);
      const existingTeam = game.teams[teamName];
      if (existingTeam && String(existingTeam.userId) !== ownerId) {
        respond({ ok: false, message: "That franchise is already taken in this room." });
        return;
      }
      if (currentUserTeam && currentUserTeam !== teamName) {
        respond({ ok: false, message: `You already control ${currentUserTeam} in this room.` });
        return;
      }
      if (!existingTeam) game.teams[teamName] = { userId: ownerId, budget: 12000, squad: [] };

      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { $set: { activeRoomId: roomId, activeTeamName: teamName } });
      }
      await persistGame(roomId);
      io.to(roomId).emit("update_teams", game.teams);
      const isAdmin = isRoomAdmin(socket, game, roomId);
      respond({ ok: true, teamName, isAdmin });
      if (socket.userId) socket.emit("session_restored", { roomId, teamName, isAdmin });
    } catch (error) {
      console.error("Could not save franchise selection:", error.message);
      respond({ ok: false, message: "Could not save your franchise selection. Please retry." });
    }
  });

  socket.on("toggle_pause", async ({ roomId } = {}) => {
    try {
      const normalizedRoomId = String(roomId || "").trim().toUpperCase();
      const game = activeGames[normalizedRoomId];
      if (!isRoomAdmin(socket, game, normalizedRoomId) || game.isTransitioning) return;

      game.isPaused = !game.isPaused;
      if (game.isPaused) {
        freezeTimer(game);
      } else if (game.hasAuctionStarted && game.timer > 0) {
        startTimer(normalizedRoomId, false);
      }
      await persistGame(normalizedRoomId);
      io.to(normalizedRoomId).emit("pause_status", game.isPaused);
      io.to(normalizedRoomId).emit("timer_update", game.timer);
    } catch (error) {
      emitConnectionError(socket, error, "Could not update auction pause state:");
    }
  });

  socket.on("place_bid", async (data = {}) => {
    try {
      const { amount, teamName } = data;
      const roomId = String(data.roomId || "").trim().toUpperCase();
      const game = activeGames[roomId];
      if (!game || !socket.rooms.has(roomId) || game.isPaused || game.isTransitioning) return;
      if (!game.gameStarted) {
        socket.emit("error_message", "The host has not started the auction yet.");
        return;
      }
      const teamWallet = game.teams[teamName];
      const ownerId = socket.userId || socket.id;
      if (!teamWallet || String(teamWallet.userId) !== ownerId || teamWallet.budget < amount) return;
      if (Number.isFinite(amount) && amount > game.auctionState.currentBid) {
        game.hasAuctionStarted = true;
        game.auctionState.currentBid = amount;
        game.auctionState.currentLeader = teamName;
        await persistGame(roomId);
        io.to(roomId).emit("update_auction", game.auctionState);
        startTimer(roomId);
      }
    } catch (error) {
      emitConnectionError(socket, error, "Could not place bid:");
    }
  });

  socket.on("next_player", async (requestedRoomId) => {
    try {
      const roomId = String(requestedRoomId || "").trim().toUpperCase();
      const game = activeGames[roomId];
      if (!isRoomAdmin(socket, game, roomId) || game.isTransitioning) return;
      game.hasAuctionStarted = true;
      freezeTimer(game);
      await persistGame(roomId);
      processSale(roomId);
    } catch (error) {
      emitConnectionError(socket, error, "Could not advance auction:");
    }
  });

  socket.on("start_auction", async (requestedRoomId) => {
    try {
      const roomId = String(requestedRoomId || "").trim().toUpperCase();
      const game = activeGames[roomId];
      if (!isRoomAdmin(socket, game, roomId)) return;
      game.gameStarted = true;
      await persistGame(roomId);
      io.to(roomId).emit("auction_status", true);
    } catch (error) {
      emitConnectionError(socket, error, "Could not start auction:");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

async function initializeGame() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
    if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
      throw new Error("JWT_SECRET must be a unique random value of at least 32 bytes.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas.");
    GLOBAL_PLAYERS = await Player.find({}).lean();
    console.log(`Loaded ${GLOBAL_PLAYERS.length} auction players.`);

    const savedRooms = await AuctionRoom.find({}).lean();
    for (const record of savedRooms) {
      activeGames[record.roomId] = hydrateGame(record);
    }
    for (const [roomId, game] of Object.entries(activeGames)) {
      if (game.hasAuctionStarted && !game.isPaused) {
        if (game.timer <= 0) {
          game.timer = 0;
          setImmediate(() => processSale(roomId));
        } else {
          startTimer(roomId, false);
        }
      }
    }
    console.log(`Restored ${savedRooms.length} saved auction rooms.`);

    const port = process.env.PORT || 3001;
    server.listen(port, () => console.log(`Server listening on port ${port}.`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exitCode = 1;
  }
}

initializeGame();
