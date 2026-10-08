const mongoose = require("mongoose");

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
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
