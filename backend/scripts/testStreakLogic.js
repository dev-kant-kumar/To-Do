const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/userModel");
const StreakEntry = require("../src/models/streakModel");
const { processStreakEmails, getTodayKey, getYesterdayKey, getTwoDaysAgoKey } = require("../src/utils/streakEmailService");

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function run() {
  console.log("=== STARTING STREAK LOGIC INTEGRATION TEST ===");

  try {
    await connectDB();

    const email = "test-streak-system-user@example.com";
    
    // Clean up any old test user
    await User.deleteMany({ email });
    
    // Create new test user
    const testUser = new User({
      name: "Test User",
      username: "teststreakuser",
      email: email,
      password: "password123",
      date: new Date().toISOString(),
      isVerified: true
    });
    await testUser.save();
    console.log(`Created test user: ${email} (ID: ${testUser._id})`);

    const userId = testUser._id.toString();

    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();
    const twoDaysAgoKey = getTwoDaysAgoKey();

    // Helper to setup mock active days
    const setupActivity = async (dates) => {
      await StreakEntry.deleteMany({ userId });
      for (const d of dates) {
        await new StreakEntry({ userId, dateKey: d, count: 1 }).save();
      }
      // Reset user email fields
      await User.updateOne({ _id: userId }, {
        $unset: { lastStreakWarningSentAt: "", lastStreakLostSentAt: "" }
      });
      console.log(`Setup mock activity for dates: [${dates.join(", ")}]`);
    };

    // --- TEST CASE 1: Active Today ---
    console.log("\n--- Test Case 1: Active Today (Streak safe, should send no emails) ---");
    await setupActivity([todayKey, yesterdayKey]);
    let result = await processStreakEmails(true); // dryRun = true
    if (result.warningsSent === 0 && result.lostsSent === 0) {
      console.log("PASS: Case 1 behaved correctly.");
    } else {
      console.error("FAIL: Case 1 sent emails unexpectedly.", result);
    }

    // --- TEST CASE 2: Active Yesterday (At Risk, should send warning) ---
    console.log("\n--- Test Case 2: Active Yesterday (Streak at risk, should send warning) ---");
    await setupActivity([yesterdayKey, twoDaysAgoKey]);
    result = await processStreakEmails(true); // dryRun = true
    if (result.warningsSent === 1 && result.lostsSent === 0) {
      console.log("PASS: Case 2 behaved correctly (warning triggered).");
    } else {
      console.error("FAIL: Case 2 failed to trigger warning correctly.", result);
    }

    // --- TEST CASE 3: Active Two Days Ago (Lost, should send lost notification) ---
    console.log("\n--- Test Case 3: Active Two Days Ago (Streak lost, should send lost notification) ---");
    await setupActivity([twoDaysAgoKey, "2026-06-23"]); // two days ago and three days ago
    result = await processStreakEmails(true); // dryRun = true
    if (result.warningsSent === 0 && result.lostsSent === 1) {
      console.log("PASS: Case 3 behaved correctly (lost notification triggered).");
    } else {
      console.error("FAIL: Case 3 failed to trigger lost notification correctly.", result);
    }

    // Clean up
    await User.deleteMany({ email });
    await StreakEntry.deleteMany({ userId });
    console.log("\nCleaned up test user and streak entries.");
    console.log("=== INTEGRATION TEST FINISHED SUCCESSFULLY ===");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
