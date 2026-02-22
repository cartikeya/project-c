const mongoose = require("mongoose");
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String }, // Mapped from "player style"
  nationality: { type: String }, // "India" or "Overseas"
  basePrice: { type: Number }, // Mapped from "base price (in lacs)"
  franchise: { type: String }, // "KKR", "MI", etc.
  status: { type: String }, // "RETAINED" or "AUCTION"
  isSold: { type: Boolean, default: false }, // We add this to track the game state!
});

module.exports = mongoose.model("Player", playerSchema);
