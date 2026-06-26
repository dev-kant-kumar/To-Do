/**
 * gamificationUtils.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for XP / Level / Streak / Badge math.
 * Pure functions — no side effects, no imports, safe to import anywhere.
 *
 * Level formula: XP needed to reach level L  =  sum(i * 100) for i = 1..L-1
 *   Level 1 →   0 XP total
 *   Level 2 → 100 XP total
 *   Level 3 → 300 XP total  (100+200)
 *   Level 4 → 600 XP total  (100+200+300)
 *   Level 5 → 1000 XP total (100+200+300+400)
 *   … and so on — matches backend xpService.js exactly
 */

// ── Level titles ──────────────────────────────────────────────────
export const LEVEL_TITLES = [
  { min: 1,  max: 1,  title: "Novice",        tier: "bronze",   color: "#a16207" },
  { min: 2,  max: 2,  title: "Apprentice",    tier: "bronze",   color: "#ca8a04" },
  { min: 3,  max: 3,  title: "Achiever",      tier: "silver",   color: "#94a3b8" },
  { min: 4,  max: 4,  title: "Warrior",       tier: "silver",   color: "#64748b" },
  { min: 5,  max: 5,  title: "Champion",      tier: "gold",     color: "#eab308" },
  { min: 6,  max: 6,  title: "Master",        tier: "gold",     color: "#f59e0b" },
  { min: 7,  max: 7,  title: "Grandmaster",   tier: "platinum", color: "#67e8f9" },
  { min: 8,  max: 8,  title: "Legend",        tier: "platinum", color: "#22d3ee" },
  { min: 9,  max: 9,  title: "Myth",          tier: "diamond",  color: "#a78bfa" },
  { min: 10, max: 10, title: "Transcendent",  tier: "diamond",  color: "#8b5cf6" },
];

// ── Streak badge milestones ───────────────────────────────────────
export const STREAK_MILESTONES = [
  { days: 3,   badge: "Starter Spark",     emoji: "✨", color: "#fbbf24" },
  { days: 7,   badge: "Week Warrior",      emoji: "🏆", color: "#f59e0b" },
  { days: 14,  badge: "Fortnight Force",   emoji: "⚡", color: "#6366f1" },
  { days: 30,  badge: "Monthly Master",    emoji: "💎", color: "#06b6d4" },
  { days: 100, badge: "Century Centurion", emoji: "🔱", color: "#8b5cf6" },
  { days: 365, badge: "Legendary Streak",  emoji: "👑", color: "#ec4899" },
];

// ── Core XP helpers ───────────────────────────────────────────────

/**
 * Returns total XP required to *reach* a given level from scratch.
 * Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP …
 */
export function xpRequiredForLevel(level) {
  let total = 0;
  for (let l = 1; l < level; l++) total += l * 100;
  return total;
}

/**
 * XP needed to complete a single level (go from level L to L+1).
 * Equivalent to level * 100.
 */
export function xpForLevel(level) {
  return level * 100;
}

/**
 * Computes a full breakdown from a raw cumulative XP number.
 * Returns everything the UI needs to render XP/level displays.
 *
 * @param {number} totalXp  – raw cumulative XP from the DB / Redux
 * @returns {{
 *   level: number,
 *   xpInLevel: number,     // XP earned in the current level
 *   xpForThisLevel: number, // XP needed to complete current level
 *   xpToNext: number,       // XP still needed to level up
 *   progressPercent: number, // 0-100
 *   levelTitle: string,
 *   levelTier: string,
 *   levelColor: string,
 *   totalXp: number
 * }}
 */
export function computeXPBreakdown(totalXp) {
  const xp = Math.max(0, totalXp || 0);
  let level = 1;
  let remaining = xp;

  while (true) {
    const threshold = level * 100;
    if (remaining >= threshold) {
      remaining -= threshold;
      level++;
    } else {
      break;
    }
  }

  const xpInLevel = remaining;
  const xpForThisLevel = level * 100;
  const xpToNext = xpForThisLevel - xpInLevel;
  const progressPercent = Math.min(
    Math.round((xpInLevel / xpForThisLevel) * 100),
    100
  );

  const titleEntry = LEVEL_TITLES.find(
    (t) => level >= t.min && level <= t.max
  ) || LEVEL_TITLES[LEVEL_TITLES.length - 1];

  return {
    level,
    xpInLevel,
    xpForThisLevel,
    xpToNext,
    progressPercent,
    totalXp: xp,
    levelTitle: titleEntry.title,
    levelTier: titleEntry.tier,
    levelColor: titleEntry.color,
  };
}

/**
 * Returns the level-title config object for a given level number.
 */
export function getLevelInfo(level) {
  return (
    LEVEL_TITLES.find((t) => level >= t.min && level <= t.max) ||
    LEVEL_TITLES[LEVEL_TITLES.length - 1]
  );
}

/**
 * Returns array of earned streak milestone badges for a given streak count.
 */
export function getEarnedBadges(currentStreak) {
  return STREAK_MILESTONES.filter((m) => (currentStreak || 0) >= m.days);
}

/**
 * Returns the next unearned milestone, or null if all earned.
 */
export function getNextStreakMilestone(currentStreak) {
  return STREAK_MILESTONES.find((m) => m.days > (currentStreak || 0)) || null;
}

/**
 * Returns progress toward the next streak milestone (0-1).
 */
export function getStreakMilestoneProgress(currentStreak) {
  const earned = getEarnedBadges(currentStreak);
  const next = getNextStreakMilestone(currentStreak);
  if (!next) return 1;
  const prev = earned.length > 0 ? earned[earned.length - 1].days : 0;
  return Math.min((currentStreak - prev) / (next.days - prev), 1);
}

/**
 * Returns CSS gradient string and glow colour for a level tier.
 */
export function getTierGradient(tier) {
  const map = {
    bronze:   { gradient: "from-amber-700 via-amber-600 to-yellow-500",   glow: "rgba(180,83,9,0.5)"    },
    silver:   { gradient: "from-slate-400 via-slate-300 to-zinc-200",     glow: "rgba(148,163,184,0.4)" },
    gold:     { gradient: "from-yellow-400 via-amber-400 to-yellow-300",  glow: "rgba(234,179,8,0.5)"   },
    platinum: { gradient: "from-cyan-300 via-sky-300 to-indigo-300",      glow: "rgba(103,232,249,0.4)" },
    diamond:  { gradient: "from-violet-400 via-purple-400 to-fuchsia-400",glow: "rgba(167,139,250,0.5)" },
  };
  return map[tier] || map.bronze;
}
