const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const { processStreakEmails } = require("../src/utils/streakEmailService");

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Process streak emails
    await processStreakEmails(dryRun);

    console.log("[STREAK-EMAIL] Execution finished successfully.");
  } catch (error) {
    console.error("[STREAK-EMAIL] Fatal execution error:", error);
  } finally {
    // 3. Close DB connection
    await mongoose.connection.close();
    console.log("[STREAK-EMAIL] Closed MongoDB connection.");
    process.exit(0);
  }
}

run();
