const mongoose = require("mongoose");

const auctionRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teams: { type: mongoose.Schema.Types.Mixed, default: {} },
    auctionState: { type: mongoose.Schema.Types.Mixed, required: true },
    playerIndex: { type: Number, default: 0 },
    gameStarted: { type: Boolean, default: false },
    hasAuctionStarted: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    timer: { type: Number, default: 10 },
    timerEndsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuctionRoom", auctionRoomSchema);
