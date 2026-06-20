const mongoose = require("mongoose");
require("dotenv").config();

async function runDB() {
  const maxRetries = 5;
  const retryInterval = 5000; // 5 seconds
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`Connecting to MongoDB (Attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(process.env.DB_URL);
      
      // Ping database to confirm successful connection
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      return;
    } catch (err) {
      console.error(`Failed connection attempt ${attempt}/${maxRetries} to MongoDB:`, err.message);
      if (attempt === maxRetries) {
        console.error("Fatal: Maximum MongoDB connection attempts reached. Exiting server process.");
        process.exit(1);
      }
      attempt++;
      console.log(`Waiting ${retryInterval / 1000} seconds before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
}

module.exports = runDB;

