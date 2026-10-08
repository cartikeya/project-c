const mongoose = require("mongoose");

<<<<<<< HEAD
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    picture: { type: String, default: "" },
    activeRoomId: { type: String, default: null, index: true },
    activeTeamName: { type: String, default: null },
=======
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password remains required for password-only accounts, but Google-only
    // accounts do not have (and should not need) a password.
    password: {
      type: String,
      required: function passwordRequired() {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    picture: {
      type: String,
      default: "",
    },
    activeRoomId: {
      type: String,
      default: null,
    },
    activeTeamName: {
      type: String,
      default: null,
    },
>>>>>>> origin/main
  },
  { timestamps: true },
);

<<<<<<< HEAD
module.exports = mongoose.model("User", userSchema);
=======
module.exports = mongoose.model("User", UserSchema);
>>>>>>> origin/main
