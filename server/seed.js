// server/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const Player = require("./models/Player");
const rawData = require("./playersData.json"); // Your JSON file

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB for Seeding..."))
  .catch((err) => console.log(err));

async function seedDatabase() {
  try {
    // 1. Clear out any old data so we don't get duplicates
    await Player.deleteMany({});
    console.log("Cleared old players.");

    // 2. Clean and format the data
    const formattedPlayers = rawData.map((p) => {
      // Fix empty base prices (e.g. retained players have "")
      let price = parseInt(p["base price (in lacs)"]);
      if (isNaN(price)) price = 0;

      return {
        name: p.name,
        role: p["player style"],
        nationality: p.nationality,
        basePrice: price,
        franchise: p.franchise,
        status: p.status,
        isSold: false,
      };
    });

    // 3. Insert into MongoDB
    await Player.insertMany(formattedPlayers);
    console.log(
      `Successfully added ${formattedPlayers.length} players to the database!`,
    );

    process.exit(); // Close the script
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedDatabase();
