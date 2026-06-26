const User = require("../models/userModel");
const StreakEntry = require("../models/streakModel");
const { sendEmail, getTemplateContent } = require("./mailer");

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTwoDaysAgoKey() {
  const now = new Date();
  now.setDate(now.getDate() - 2);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the current streak of a user ending on a specific dateKey.
 * @param {Array} entries - StreakEntry documents sorted by dateKey descending
 * @param {string} lastActiveDateKey - The date key to start calculation from
 * @returns {number} The streak length
 */
function calculateStreakEndingOn(entries, lastActiveDateKey) {
  const activeDates = new Set(entries.map(e => e.dateKey));
  let streakCount = 0;
  let cursor = new Date(lastActiveDateKey);

  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    
    if (activeDates.has(key)) {
      streakCount++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streakCount;
}

/**
 * Evaluates all verified users and dispatches streak-warning or streak-lost emails as appropriate.
 * @param {boolean} dryRun - If true, only logs actions without sending actual emails or updating DB.
 */
async function processStreakEmails(dryRun = false) {
  console.log(`[STREAK-EMAIL] Starting evaluation process. Dry run: ${dryRun}`);
  
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const twoDaysAgoKey = getTwoDaysAgoKey();
  
  console.log(`[STREAK-EMAIL] Date Keys - Today: ${todayKey}, Yesterday: ${yesterdayKey}, Two Days Ago: ${twoDaysAgoKey}`);

  const users = await User.find({ isVerified: true });
  console.log(`[STREAK-EMAIL] Found ${users.length} verified users to evaluate.`);

  let warningsSent = 0;
  let lostsSent = 0;

  for (const user of users) {
    try {
      // Find all streak entries with active completions
      const entries = await StreakEntry.find({
        userId: user._id.toString(),
        count: { $gt: 0 }
      }).sort({ dateKey: -1 }).lean();

      if (entries.length === 0) {
        // User has no activity history
        continue;
      }

      const lastActiveDateKey = entries[0].dateKey;
      const streakCount = calculateStreakEndingOn(entries, lastActiveDateKey);

      if (lastActiveDateKey === todayKey) {
        // Active today, streak is safe
        console.log(`[STREAK-EMAIL] User ${user.email} is active today. Streak: ${streakCount}. Safe.`);
        continue;
      }

      if (lastActiveDateKey === yesterdayKey) {
        // Active yesterday, but not today yet. Streak is at risk!
        if (user.lastStreakWarningSentAt === todayKey) {
          console.log(`[STREAK-EMAIL] User ${user.email} at risk (streak: ${streakCount}), but warning email already sent today.`);
          continue;
        }

        console.log(`[STREAK-EMAIL] User ${user.email} at risk! Last active: ${lastActiveDateKey}. Streak: ${streakCount}. Sending warning...`);
        
        if (!dryRun) {
          const htmlContent = getTemplateContent("streak-warning", {
            name: user.name,
            streak: streakCount.toString()
          });

          await sendEmail({
            to: user.email,
            subject: `🔥 Keep your ${streakCount}-day streak alive!`,
            htmlContent
          });

          user.lastStreakWarningSentAt = todayKey;
          await user.save();
        }
        warningsSent++;
      } else if (lastActiveDateKey === twoDaysAgoKey) {
        // Last active two days ago. That means yesterday they missed.
        // Today is the first day the streak has officially reset.
        if (user.lastStreakLostSentAt === todayKey) {
          console.log(`[STREAK-EMAIL] User ${user.email} lost streak (was: ${streakCount}), but lost email already sent today.`);
          continue;
        }

        console.log(`[STREAK-EMAIL] User ${user.email} lost streak! Last active: ${lastActiveDateKey}. Streak was: ${streakCount}. Sending lost notification...`);

        if (!dryRun) {
          const htmlContent = getTemplateContent("streak-lost", {
            name: user.name,
            streak: streakCount.toString()
          });

          await sendEmail({
            to: user.email,
            subject: `😢 Your ${streakCount}-day streak has reset`,
            htmlContent
          });

          user.lastStreakLostSentAt = todayKey;
          await user.save();
        }
        lostsSent++;
      } else {
        // Lost a while ago
        console.log(`[STREAK-EMAIL] User ${user.email} streak already inactive (last active: ${lastActiveDateKey}). No action.`);
      }
    } catch (err) {
      console.error(`[STREAK-EMAIL] Error processing user ${user.email}:`, err.message);
    }
  }

  console.log(`[STREAK-EMAIL] Evaluation complete. Warnings: ${warningsSent}, Resets: ${lostsSent}`);
  return { warningsSent, lostsSent };
}

module.exports = {
  processStreakEmails,
  getTodayKey,
  getYesterdayKey,
  getTwoDaysAgoKey,
  calculateStreakEndingOn
};
