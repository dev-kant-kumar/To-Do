/**
 * GamificationBar.jsx
 * ─────────────────────────────────────────────────────────────────
 * Unified, static XP / Level progress bar (animations removed).
 * Used in: Dashboard hero, Profile gamification tab, Leaderboard self-card.
 *
 * Props:
 *   xp       {number}  – raw cumulative XP
 *   streak   {number}  – current streak days (optional, for display)
 *   size     {"sm"|"md"|"lg"} – compact vs full layout
 *   showStreak {bool}  – whether to show streak pill
 *   className {string} – optional extra classes
 */
import React from "react";
import { Zap, Flame, TrendingUp } from "lucide-react";
import {
  computeXPBreakdown,
  getTierGradient,
} from "../utils/gamificationUtils";

const tierColors = {
  bronze:   "linear-gradient(135deg, #b45309, #d97706, #f59e0b)",
  silver:   "linear-gradient(135deg, #94a3b8, #cbd5e1, #e2e8f0)",
  gold:     "linear-gradient(135deg, #eab308, #facc15, #fef08a)",
  platinum: "linear-gradient(135deg, #67e8f9, #7dd3fc, #a5b4fc)",
  diamond:  "linear-gradient(135deg, #a78bfa, #c084fc, #e879f9)",
};

export default function GamificationBar({
  xp = 0,
  streak = 0,
  size = "md",
  showStreak = true,
  className = "",
}) {
  const {
    level,
    xpInLevel,
    xpForThisLevel,
    xpToNext,
    progressPercent,
    levelTitle,
    levelTier,
  } = computeXPBreakdown(xp);

  const tierStyle = getTierGradient(levelTier);
  const progressPercentValue = Math.min(Math.max(progressPercent, 0), 100);

  if (size === "sm") {
    // ── COMPACT (leaderboard self-card) ──
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-black shadow-lg"
              style={{
                background: tierColors[levelTier] || tierColors.bronze,
                boxShadow: `0 0 8px ${tierStyle.glow.replace("0.5", "0.25")}`,
              }}
            >
              {level}
            </div>
            <span className="text-[10px] font-bold text-zinc-300">{levelTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {showStreak && streak > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400">
                <Flame className="w-2.5 h-2.5 fill-amber-500" />
                {streak}d
              </span>
            )}
            <span className="text-[9px] text-zinc-650 font-mono">
              {xpInLevel.toLocaleString()}/{xpForThisLevel.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="h-1 w-full rounded-full bg-zinc-800/80 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPercentValue}%`,
              background: tierColors[levelTier] || tierColors.bronze,
              boxShadow: `0 0 6px ${tierStyle.glow.replace("0.5", "0.3")}`,
            }}
          />
        </div>
      </div>
    );
  }

  if (size === "lg") {
    // ── FULL (dashboard hero, profile tab) ──
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        {/* Top row — level badge + title + XP numbers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Level badge */}
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-black shadow-lg flex-shrink-0"
              style={{
                background: tierColors[levelTier] || tierColors.bronze,
                boxShadow: `0 0 16px ${tierStyle.glow.replace("0.5", "0.25")}, 0 4px 12px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, transparent 55%)" }} />
              <span className="relative z-10">{level}</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-450">
                  Level {level}
                </span>
              </div>
              <span className="text-[11px] font-bold text-zinc-300">{levelTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showStreak && streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{streak}d</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-300 font-mono">
                <span>{xpInLevel.toLocaleString()}</span>
                <span className="text-zinc-600">/{xpForThisLevel.toLocaleString()} XP</span>
              </div>
              <div className="text-[9px] text-zinc-600 font-semibold">
                {xpToNext.toLocaleString()} to next level
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
          {/* Fill */}
          <div
            className="h-full rounded-full relative"
            style={{
              width: `${progressPercentValue}%`,
              background: tierColors[levelTier] || tierColors.bronze,
              boxShadow: `0 0 10px ${tierStyle.glow.replace("0.5", "0.3")}`,
            }}
          >
            {/* Tip glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 blur-[2px]" />
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-semibold text-zinc-650 uppercase tracking-wider">
              Total: {xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: tierColors[levelTier] || tierColors.bronze,
                boxShadow: `0 0 4px ${tierStyle.glow.replace("0.5", "0.3")}`,
              }}
            />
            <span className="text-[9px] text-zinc-650 font-semibold uppercase tracking-wider">
              {levelTier} tier
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── MEDIUM (default, profile sidebar) ──
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-black shadow-md"
            style={{
              background: tierColors[levelTier] || tierColors.bronze,
              boxShadow: `0 0 10px ${tierStyle.glow.replace("0.5", "0.25")}`,
            }}
          >
            {level}
          </div>
          <div>
            <span className="text-[10px] font-bold text-violet-400 block">Lv {level} · {levelTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showStreak && streak > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
              <Flame className="w-3 h-3 fill-amber-500" />
              {streak}d
            </span>
          )}
          <span className="text-[10px] text-zinc-500 font-mono">
            {xpInLevel}/{xpForThisLevel} XP
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progressPercentValue}%`,
            background: tierColors[levelTier] || tierColors.bronze,
            boxShadow: `0 0 8px ${tierStyle.glow.replace("0.5", "0.3")}`,
          }}
        />
      </div>
    </div>
  );
}
