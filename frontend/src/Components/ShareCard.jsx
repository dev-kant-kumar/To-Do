/**
 * ShareCard.jsx
 * ─────────────────────────────────────────────────────────────────
 * Premium shareable card system — three card types:
 *   "rank"        – Leaderboard rank card
 *   "streak"      – Streak achievement card
 *   "achievement" – Level / XP achievement card
 *
 * IMPORTANT: Card content components use zero framer-motion animations
 * so they render cleanly as PNG images via html-to-canvas export.
 * Motion is used only in the modal shell (backdrop, panel entry).
 */
import React, { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Trophy,
  Flame,
  Zap,
  Crown,
  Star,
  Shield,
  TrendingUp,
  ArrowUp,
} from "lucide-react";
import { CustomBadgeSvg } from "./CustomBadgeSvg";
import {
  computeXPBreakdown,
  getTierGradient,
  getLevelInfo,
  getEarnedBadges,
  STREAK_MILESTONES,
} from "../utils/gamificationUtils";

/* ─────────────────────────────────────────────────────────────────
   CARD: RANK
   Layout: Dark background · Hero rank badge (left) · User info (right)
           XP progress bar · 3-stat row · Footer brand
───────────────────────────────────────────────────────────────── */
function RankCardContent({ data }) {
  const { name, username, rank, level, xp, currentStreak } = data;
  const xpInfo = computeXPBreakdown(xp || 0);
  const tierStyle = getTierGradient(xpInfo.levelTier);

  const rankMeta =
    rank === 1
      ? { badge: "linear-gradient(145deg,#fde047,#eab308,#ca8a04)", glow: "rgba(234,179,8,0.5)", textColor: "#fef08a", label: "GOLD" }
      : rank === 2
      ? { badge: "linear-gradient(145deg,#f1f5f9,#cbd5e1,#94a3b8)", glow: "rgba(148,163,184,0.45)", textColor: "#f1f5f9", label: "SILVER" }
      : rank === 3
      ? { badge: "linear-gradient(145deg,#fdba74,#f97316,#c2410c)", glow: "rgba(249,115,22,0.5)", textColor: "#fed7aa", label: "BRONZE" }
      : { badge: "linear-gradient(145deg,#c084fc,#9333ea,#6b21a8)", glow: "rgba(147,51,234,0.45)", textColor: "#e9d5ff", label: "RANKED" };

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(160deg, #0d0d18 0%, #0f0d20 60%, #0d0d18 100%)",
        border: "1px solid rgba(139,92,246,0.18)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Background pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 15% 85%, rgba(139,92,246,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(234,179,8,0.06) 0%, transparent 50%)",
      }} />

      {/* Top accent line */}
      <div style={{ height: 3, background: rankMeta.badge, width: "100%" }} />

      {/* Header: brand + category */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(124,58,237,0.45)",
          }}>
            <span style={{ fontSize: 12, color: "white", fontWeight: 900, lineHeight: 1 }}>✓</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            todo<span style={{ color: "#a855f7" }}>.</span>
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <Trophy size={9} color="#fbbf24" />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Leaderboard
          </span>
        </div>
      </div>

      {/* Hero: rank badge + user info */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 20px 18px" }}>
        {/* Rank badge */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {rank <= 3 && (
            <div style={{
              position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
              fontSize: 16,
            }}>
              {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
            </div>
          )}
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: rankMeta.badge,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 28px ${rankMeta.glow}, 0 8px 24px rgba(0,0,0,0.5)`,
            position: "relative", overflow: "hidden",
          }}>
            {/* Shine */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
              borderRadius: "20px 20px 0 0",
            }} />
            <span style={{ fontSize: 32, fontWeight: 900, color: "rgba(0,0,0,0.75)", lineHeight: 1, position: "relative" }}>
              #{rank}
            </span>
          </div>
          <div style={{
            textAlign: "center", marginTop: 6,
            fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
            color: rankMeta.textColor, textTransform: "uppercase",
          }}>
            {rankMeta.label}
          </div>
        </div>

        {/* User info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#f4f4f5", lineHeight: 1.2, marginBottom: 3 }}>
            {name}
          </div>
          <div style={{ fontSize: 11, color: "#71717a", fontFamily: "monospace", marginBottom: 10 }}>
            @{username}
          </div>

          {/* Level + streak pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 10,
              background: `linear-gradient(135deg, ${tierStyle.glow.replace("0.5","0.15")}, ${tierStyle.glow.replace("0.5","0.05")})`,
              border: `1px solid ${tierStyle.glow.replace("0.5","0.35")}`,
              boxShadow: `0 0 8px ${tierStyle.glow.replace("0.5","0.2")}`,
            }}>
              <Star size={9} color="#fbbf24" />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#f4f4f5" }}>
                Lv {xpInfo.level} · {xpInfo.levelTitle}
              </span>
            </div>
            {(currentStreak || 0) > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 10,
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
              }}>
                <Flame size={9} color="#f59e0b" />
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24" }}>
                  {currentStreak}d streak
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            XP Progress to Level {xpInfo.level + 1}
          </span>
          <span style={{ fontSize: 9, color: "#52525b", fontFamily: "monospace" }}>
            {xpInfo.xpInLevel.toLocaleString()} / {xpInfo.xpForThisLevel.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 6,
            background: `linear-gradient(90deg, ${tierStyle.glow.replace("rgba(","rgba(").replace(",0.5)",",0.8)")}, ${tierStyle.glow})`,
            width: `${xpInfo.progressPercent}%`,
            boxShadow: `0 0 8px ${tierStyle.glow}`,
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 16px" }}>
        {[
          { label: "Global Rank", value: `#${rank}`, color: rankMeta.textColor },
          { label: "Total XP", value: (xp || 0).toLocaleString(), color: "#a78bfa" },
          { label: "Streak", value: `${currentStreak || 0}d`, color: "#fbbf24" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "10px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "monospace" }}>todo.app · Productivity Leaderboard</span>
        <span style={{ fontSize: 9, color: "#3f3f46" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CARD: STREAK
   Layout: Dark warm bg · Big number + flame · 7-day habit grid
           Best streak stat · Earned badges row · Footer
───────────────────────────────────────────────────────────────── */
function StreakCardContent({ data }) {
  const { name, username, currentStreak = 0, longestStreak = 0 } = data;
  const earnedBadges = getEarnedBadges(longestStreak || currentStreak);

  // Build a 7-day activity grid (last 7 days placeholder pattern)
  const days7 = ["M", "T", "W", "T", "F", "S", "S"];
  // Mark the last `currentStreak` days (capped at 7) as active from today back
  const today = new Date().getDay(); // 0=Sun
  const activeCount = Math.min(currentStreak, 7);

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(165deg, #0d0a00 0%, #130c00 50%, #0d0a00 100%)",
        border: "1px solid rgba(245,158,11,0.18)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.09) 0%, transparent 60%)",
      }} />

      {/* Top accent line */}
      <div style={{
        height: 3, width: "100%",
        background: "linear-gradient(90deg, #d97706, #fbbf24, #f59e0b, #d97706)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(124,58,237,0.45)",
          }}>
            <span style={{ fontSize: 12, color: "white", fontWeight: 900, lineHeight: 1 }}>✓</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            todo<span style={{ color: "#a855f7" }}>.</span>
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 20,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
        }}>
          <Flame size={9} color="#f59e0b" />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Streak
          </span>
        </div>
      </div>

      {/* Hero: big streak number */}
      <div style={{ textAlign: "center", padding: "10px 20px 20px", position: "relative" }}>
        {/* User name */}
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12, fontWeight: 600 }}>
          <span style={{ color: "#d4d4d8", fontWeight: 700 }}>{name}</span>
          <span style={{ color: "#52525b" }}> is on a roll 🔥</span>
        </div>

        {/* Giant number */}
        <div style={{
          fontSize: 88, fontWeight: 900, lineHeight: 1,
          background: "linear-gradient(180deg, #fef3c7 0%, #fbbf24 35%, #f59e0b 70%, #d97706 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 24px rgba(245,158,11,0.45))",
          marginBottom: 4,
        }}>
          {currentStreak}
        </div>

        {/* Label */}
        <div style={{
          fontSize: 12, fontWeight: 800, letterSpacing: "0.45em",
          color: "#d97706", textTransform: "uppercase", marginBottom: 16,
        }}>
          Day Streak
        </div>

        {/* 7-day habit grid */}
        <div style={{
          display: "inline-flex", gap: 8, padding: "10px 16px",
          background: "rgba(255,255,255,0.03)", borderRadius: 14,
          border: "1px solid rgba(245,158,11,0.1)",
        }}>
          {days7.map((d, i) => {
            // Mark the last activeCount days as filled
            const isActive = i >= (7 - activeCount);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: isActive
                    ? "linear-gradient(145deg, #fbbf24, #f59e0b)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid rgba(251,191,36,0.6)"
                    : "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isActive ? "0 0 8px rgba(251,191,36,0.3)" : "none",
                }}>
                  {isActive && <Flame size={13} color="#431407" />}
                </div>
                <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? "#d97706" : "#3f3f46", textTransform: "uppercase" }}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 20px 16px" }}>
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 12, padding: "12px 8px", textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{currentStreak}d</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>Current</div>
        </div>
        <div style={{
          background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
          borderRadius: 12, padding: "12px 8px", textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>{longestStreak || currentStreak}d</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#4c1d95", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>Best Ever</div>
        </div>
      </div>

      {/* Earned badges row */}
      {earnedBadges.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8, textAlign: "center" }}>
            Badges Earned
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {earnedBadges.map((badge) => (
              <div key={badge.days} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <CustomBadgeSvg days={badge.days} size={36} isUnlocked={true} />
                <span style={{ fontSize: 7, fontWeight: 700, color: "#71717a" }}>{badge.days}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "monospace" }}>todo.app · Keep it going!</span>
        <span style={{ fontSize: 9, color: "#3f3f46" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CARD: ACHIEVEMENT (Level / XP)
   Layout: Dark bg with tier color glow · Centered tier badge
           Level title · XP progress bar · 3-stat row · Footer
───────────────────────────────────────────────────────────────── */
function AchievementCardContent({ data }) {
  const { name, username, xp = 0, currentStreak = 0 } = data;
  const xpInfo = computeXPBreakdown(xp);
  const tierStyle = getTierGradient(xpInfo.levelTier);

  const tierColors = {
    bronze:   { from: "#b45309", mid: "#d97706", to: "#fbbf24", text: "#fef3c7" },
    silver:   { from: "#475569", mid: "#94a3b8", to: "#e2e8f0", text: "#f8fafc" },
    gold:     { from: "#92400e", mid: "#d97706", to: "#fde047", text: "#fef9c3" },
    platinum: { from: "#0e4f60", mid: "#0891b2", to: "#67e8f9", text: "#ecfeff" },
    diamond:  { from: "#3b0764", mid: "#7c3aed", to: "#c084fc", text: "#f3e8ff" },
  };
  const tc = tierColors[xpInfo.levelTier] || tierColors.bronze;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: `linear-gradient(165deg, #0d0d18 0%, #0f0d20 50%, #0d0d18 100%)`,
        border: `1px solid ${tierStyle.glow.replace("0.5","0.2")}`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 20%, ${tierStyle.glow.replace("0.5","0.1")} 0%, transparent 65%)`,
      }} />

      {/* Top accent line */}
      <div style={{
        height: 3, width: "100%",
        background: `linear-gradient(90deg, ${tc.from}, ${tc.mid}, ${tc.to}, ${tc.mid}, ${tc.from})`,
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "#7c3aed",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(124,58,237,0.45)",
          }}>
            <span style={{ fontSize: 12, color: "white", fontWeight: 900, lineHeight: 1 }}>✓</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            todo<span style={{ color: "#a855f7" }}>.</span>
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 20,
          background: tierStyle.glow.replace("0.5","0.08"),
          border: `1px solid ${tierStyle.glow.replace("0.5","0.25")}`,
        }}>
          <TrendingUp size={9} color={tc.to} />
          <span style={{ fontSize: 9, fontWeight: 700, color: tc.text, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Achievement
          </span>
        </div>
      </div>

      {/* Hero: Level badge + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 20px 20px", textAlign: "center" }}>
        {/* Level badge */}
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: `linear-gradient(145deg, ${tc.to}, ${tc.mid}, ${tc.from})`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${tierStyle.glow}, 0 12px 32px rgba(0,0,0,0.55)`,
          marginBottom: 16, position: "relative", overflow: "hidden",
        }}>
          {/* Shine */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
            borderRadius: "24px 24px 0 0",
          }} />
          <span style={{ fontSize: 42, fontWeight: 900, color: "rgba(0,0,0,0.7)", lineHeight: 1 }}>
            {xpInfo.level}
          </span>
          <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 2 }}>
            Level
          </span>
        </div>

        {/* Tier title */}
        <div style={{
          fontSize: 26, fontWeight: 900, lineHeight: 1.1, marginBottom: 4,
          background: `linear-gradient(135deg, ${tc.to}, ${tc.mid})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {xpInfo.levelTitle}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em",
          color: "#52525b", marginBottom: 12,
        }}>
          {xpInfo.levelTier} Tier
        </div>

        {/* User */}
        <div style={{ fontSize: 14, fontWeight: 800, color: "#d4d4d8", marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>@{username}</div>
      </div>

      {/* XP Progress */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            XP Progress
          </span>
          <span style={{ fontSize: 9, color: "#52525b", fontFamily: "monospace" }}>
            {xpInfo.xpInLevel.toLocaleString()} / {xpInfo.xpForThisLevel.toLocaleString()} XP
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 8,
            background: `linear-gradient(90deg, ${tc.from}, ${tc.to})`,
            width: `${xpInfo.progressPercent}%`,
            boxShadow: `0 0 10px ${tierStyle.glow}`,
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 16px" }}>
        {[
          { label: "Total XP", value: (xp || 0).toLocaleString(), color: tc.to },
          { label: "Streak", value: `${currentStreak}d`, color: "#fbbf24" },
          { label: "Level", value: xpInfo.level, color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "10px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "monospace" }}>todo.app · Level Achievement</span>
        <span style={{ fontSize: 9, color: "#3f3f46" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Card type config
───────────────────────────────────────────────────────────────── */
const CARD_CONFIGS = {
  rank: {
    label: "Rank Card",
    shortLabel: "Rank",
    icon: Trophy,
    color: "text-amber-400",
    accent: "#fbbf24",
    Component: RankCardContent,
    getText: (data) =>
      `🏆 I'm ranked #${data.rank} on todo. leaderboard! Level ${data.level} with ${(data.xp || 0).toLocaleString()} XP and a ${data.currentStreak || 0}-day streak. 🔥 Join me at todo.app`,
  },
  streak: {
    label: "Streak Card",
    shortLabel: "Streak",
    icon: Flame,
    color: "text-amber-400",
    accent: "#f59e0b",
    Component: StreakCardContent,
    getText: (data) =>
      `🔥 I'm on a ${data.currentStreak}-day streak on todo.! Consistency is key — join me at todo.app`,
  },
  achievement: {
    label: "Level Card",
    shortLabel: "Level",
    icon: Zap,
    color: "text-violet-400",
    accent: "#a78bfa",
    Component: AchievementCardContent,
    getText: (data) =>
      `⚡ I just hit Level ${data.level} on todo.! ${(data.xp || 0).toLocaleString()} XP earned. 💪 todo.app`,
  },
};

/* ─────────────────────────────────────────────────────────────────
   Share action helper
───────────────────────────────────────────────────────────────── */
async function performShare(type, data, setCopied) {
  const config = CARD_CONFIGS[type];
  const text = config.getText(data);

  if (navigator.share) {
    try {
      await navigator.share({ text, title: "todo. — Gamification" });
      return;
    } catch (_) {}
  }

  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────────
   Main Modal
───────────────────────────────────────────────────────────────── */
export default function ShareCardModal({ type = "rank", data = {}, onClose }) {
  const [activeType, setActiveType] = useState(type);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const config = CARD_CONFIGS[activeType] || CARD_CONFIGS.rank;
  const CardComponent = config.Component;

  const handleShare = async () => {
    setSharing(true);
    await performShare(activeType, data, setCopied);
    setSharing(false);
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const element = cardRef.current;
      const width = element.offsetWidth || 400;
      const height = element.offsetHeight || 560;

      let styleText = "";
      try {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              styleText += rule.cssText + "\n";
            }
          } catch (e) {}
        }
      } catch (err) {}

      const styleElement = document.createElement("style");
      styleElement.textContent = styleText;

      const clone = element.cloneNode(true);
      clone.appendChild(styleElement);
      clone.style.transform = "none";
      clone.style.transition = "none";
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;

      const serializedHtml = new XMLSerializer().serializeToString(clone);
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;margin:0;padding:0;box-sizing:border-box;">
              ${serializedHtml}
            </div>
          </foreignObject>
        </svg>
      `;

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = svgUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (e) => reject(new Error("Image load error: " + e));
      });

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0d0d18";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);

      const pngDataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngDataUrl;
      downloadLink.download = `todo_${activeType}_card_${data.username || "user"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setDownloading(false);
    }
  }, [activeType, data]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-lg"
          initial={{ opacity: 0, y: 32, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "rgba(9,9,15,0.98)",
              border: "1px solid rgba(63,63,70,0.65)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,92,246,0.06)",
            }}
          >
            {/* Top accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
                  <Share2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-100 leading-none">Share Progress</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Share {config.label}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Card type tabs ── */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-1 bg-zinc-950/70 border border-zinc-800/70 rounded-xl p-1">
                {Object.entries(CARD_CONFIGS).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = activeType === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveType(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-zinc-800 text-zinc-100 shadow-lg"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${isActive ? cfg.color : ""}`} />
                      <span>{cfg.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Card preview ── */}
            <div className="px-5 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeType}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div ref={cardRef}>
                    <CardComponent data={data} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Action buttons ── */}
            <div className="px-5 pb-5 flex items-center gap-2.5">
              {/* Download */}
              <motion.button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all cursor-pointer disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                  color: "white",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(124,58,237,0.45)" }}
                whileTap={{ scale: 0.98 }}
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PNG
                  </>
                )}
              </motion.button>

              {/* Share */}
              <motion.button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {sharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-violet-400" />
                    Share
                  </>
                )}
              </motion.button>

              {/* Copy text */}
              <motion.button
                onClick={async () => {
                  const text = config.getText(data);
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (_) {}
                }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Hint */}
            <div className="px-5 pb-4 -mt-2">
              <p className="text-center text-[10px] text-zinc-700">
                Download image or share your achievement link
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
