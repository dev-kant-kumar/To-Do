import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart2,
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";
import { fetchStreakData } from "../Store/Reducers/StreakSlice";

// ─── Milestone definitions ─────────────────────────────────────────────────
const MILESTONES = [
  { days: 3,   badge: "Starter Spark",    emoji: "✨" },
  { days: 7,   badge: "Week Warrior",     emoji: "🏆" },
  { days: 14,  badge: "Fortnight Force",  emoji: "⚡" },
  { days: 30,  badge: "Monthly Master",   emoji: "💎" },
  { days: 100, badge: "Century Centurion",emoji: "🔱" },
  { days: 365, badge: "Legendary Streak", emoji: "👑" },
];

function getMilestoneContext(streak) {
  let prevMilestone = { days: 0, badge: "Beginner", emoji: "🌱" };
  let nextMilestone = MILESTONES[0];
  for (let i = 0; i < MILESTONES.length; i++) {
    if (streak >= MILESTONES[i].days) {
      prevMilestone = MILESTONES[i];
      nextMilestone = MILESTONES[i + 1] || null;
    } else {
      nextMilestone = MILESTONES[i];
      break;
    }
  }
  const progress = nextMilestone
    ? (streak - prevMilestone.days) / (nextMilestone.days - prevMilestone.days)
    : 1;
  return { prevMilestone, nextMilestone, progress: Math.min(progress, 1) };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(dateKey) {
  const d = parseLocalDate(dateKey);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildLastNDays(n) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function buildYearGrid() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek - 52 * 7);
  const columns = [];
  let cursor = new Date(startDate);
  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (cursor <= today) {
        week.push(toDateKey(new Date(cursor)));
      } else {
        week.push(null);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(week);
  }
  return columns;
}

function getBestDay(activityMap) {
  let best = { key: null, count: 0 };
  for (const [key, count] of Object.entries(activityMap)) {
    if (count > best.count) best = { key, count };
  }
  return best;
}

// ─── Color helpers ─────────────────────────────────────────────────────────
function getIntensityClass(count) {
  if (!count || count === 0) return "bg-zinc-900 border-zinc-800/40";
  if (count === 1) return "bg-amber-950/80 border-amber-900/50";
  if (count <= 2) return "bg-amber-900/70 border-amber-800/50";
  if (count <= 4) return "bg-amber-700/80 border-amber-600/50";
  return "bg-amber-500 border-amber-400/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]";
}

function getBarColor(count, max) {
  if (!count || count === 0) return "bg-zinc-800";
  const ratio = count / (max || 1);
  if (ratio < 0.25) return "bg-amber-900/70";
  if (ratio < 0.5) return "bg-amber-700/80";
  if (ratio < 0.75) return "bg-amber-600";
  return "bg-amber-500";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_STRIP_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Portal Tooltip ────────────────────────────────────────────────────────
function HeatmapTooltip({ tooltip }) {
  if (!tooltip) return null;
  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: tooltip.x,
        top: tooltip.y - 10,
        transform: "translateX(-50%) translateY(-100%)",
      }}
    >
      <div className="bg-zinc-900/95 border border-zinc-700/60 backdrop-blur-md rounded-lg px-3 py-2 shadow-2xl text-center whitespace-nowrap">
        <p className="text-xs font-bold text-zinc-100">
          {tooltip.count} task{tooltip.count !== 1 ? "s" : ""} completed
        </p>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {tooltip.label ?? formatDateLabel(tooltip.dateKey)}
        </p>
      </div>
    </div>,
    document.body
  );
}

// ─── Streak Highlight Card (Duolingo-inspired inline panel) ────────────────
export function StreakHighlightCard({ currentStreak, longestStreak, activityMap }) {
  const { prevMilestone, nextMilestone, progress } = getMilestoneContext(currentStreak);

  const today = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0); return t;
  }, []);

  // Build Monday-anchored current week
  const weekDays = useMemo(() => {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [today]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-2xl overflow-hidden border border-amber-500/15"
      style={{ background: "linear-gradient(135deg, #111113 0%, #0e0e10 100%)" }}
    >
      {/* Amber radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative p-5 flex flex-col gap-5">
        {/* Top: flame + number + streak label */}
        <div className="flex items-center gap-4">
          {/* Flame */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="52" height="64" viewBox="0 0 60 80" fill="none">
                <defs>
                  <linearGradient id="at-flameGrad" x1="30" y1="80" x2="30" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                  <linearGradient id="at-innerFlame" x1="30" y1="80" x2="30" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <path d="M30 8 C30 8 14 28 14 46 C14 56 20 66 30 68 C40 66 46 56 46 46 C46 28 30 8 30 8Z" fill="url(#at-flameGrad)" />
                <path d="M30 30 C30 30 22 42 22 52 C22 58 25 63 30 64 C35 63 38 58 38 52 C38 42 30 30 30 30Z" fill="url(#at-innerFlame)" />
                <circle cx="42" cy="22" r="3" fill="#fef08a" opacity="0.8" />
              </svg>
            </motion.div>
          </div>

          {/* Number + label */}
          <div>
            <span
              className="text-5xl font-black leading-none block"
              style={{
                background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 60%, #d97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentStreak}
            </span>
            <span className="text-sm font-bold text-amber-400/80 mt-0.5 block">day streak</span>
          </div>

          {/* Right: longest streak badge */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5">
              <Trophy size={12} className="text-emerald-400" />
              <span className="text-xs font-bold text-zinc-300">{longestStreak}d</span>
            </div>
            <span className="text-[9px] text-zinc-600 font-medium pr-1">Longest</span>
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)] flex-shrink-0" />
            <div className="flex-1 relative h-2 bg-zinc-800 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.4)]"
              />
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: `calc(${progress * 100}% - 5px)` }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
              />
            </div>
            {nextMilestone && (
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 flex-shrink-0" />
            )}
          </div>
          <div className="flex justify-between px-0.5">
            <span className="text-[10px] text-amber-400 font-bold">{prevMilestone.days}d</span>
            {nextMilestone && (
              <span className="text-[10px] text-zinc-500 font-semibold">{nextMilestone.days}d</span>
            )}
          </div>
          {nextMilestone ? (
            <p className="text-xs text-zinc-400 leading-snug">
              Reach{" "}
              <span className="text-amber-400 font-bold">{nextMilestone.days} days</span>{" "}
              to unlock {nextMilestone.emoji}{" "}
              <span className="text-amber-300 font-bold">{nextMilestone.badge}</span>!
            </p>
          ) : (
            <p className="text-xs text-amber-300 font-bold">👑 Legendary Streak achieved!</p>
          )}
        </div>

        {/* Weekly strip */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
          <div className="grid grid-cols-7 gap-1">
            {WEEK_STRIP_LABELS.map((label, i) => {
              const dayDate = weekDays[i];
              const dateKey = toDateKey(dayDate);
              const hasActivity = activityMap[dateKey] && activityMap[dateKey] > 0;
              const isToday = dayDate.getTime() === today.getTime();
              const isFuture = dayDate.getTime() > today.getTime();
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[9px] font-bold ${isToday ? "text-amber-400" : "text-zinc-600"}`}>
                    {label}
                  </span>
                  {hasActivity ? (
                    <motion.div
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 400 }}
                      className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
                    >
                      <span className="text-sm">🔥</span>
                    </motion.div>
                  ) : isToday ? (
                    <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-amber-400">{dayDate.getDate()}</span>
                    </div>
                  ) : isFuture ? (
                    <div className="w-8 h-8 rounded-full border border-zinc-800/50 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-zinc-700">{dayDate.getDate()}</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-800/30 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-zinc-500">{dayDate.getDate()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chart Views ───────────────────────────────────────────────────────────

function YearHeatmap({ activityMap }) {
  const allColumns = useMemo(() => buildYearGrid(), []);
  const [tooltip, setTooltip] = useState(null);

  const { firstHalf, secondHalf } = useMemo(() => {
    const mid = Math.ceil(allColumns.length / 2);
    return { firstHalf: allColumns.slice(0, mid), secondHalf: allColumns.slice(mid) };
  }, [allColumns]);

  const getMonthLabels = (cols) => {
    const labels = [];
    let lastMonth = -1;
    cols.forEach((week, colIdx) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const month = parseLocalDate(firstDay).getMonth();
      if (month !== lastMonth) {
        labels.push({ colIdx, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    });
    return labels;
  };

  const renderRow = (cols, key) => {
    const monthLabels = getMonthLabels(cols);
    return (
      <div key={key} className="w-full">
        <div className="flex w-full mb-1 gap-[2px]">
          {cols.map((_, colIdx) => {
            const lbl = monthLabels.find((l) => l.colIdx === colIdx);
            return (
              <div key={colIdx} className="flex-1 min-w-0 overflow-visible relative h-4">
                {lbl && (
                  <span className="absolute left-0 top-0 text-[9px] text-zinc-500 font-semibold leading-none whitespace-nowrap">
                    {lbl.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex w-full gap-[2px]">
          {cols.map((week, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-[2px]">
              {week.map((dateKey, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`w-full aspect-square rounded-[2px] border cursor-pointer transition-all duration-100 hover:ring-1 hover:ring-amber-400/60 hover:brightness-125 ${
                    dateKey
                      ? getIntensityClass(activityMap[dateKey])
                      : "bg-transparent border-transparent"
                  }`}
                  onMouseEnter={(e) => {
                    if (!dateKey) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ dateKey, count: activityMap[dateKey] || 0, x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {renderRow(firstHalf, "first")}
      {renderRow(secondHalf, "second")}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px] text-zinc-600">Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className={`w-[10px] h-[10px] rounded-[2px] border ${getIntensityClass(lvl === 0 ? 0 : lvl)}`} />
        ))}
        <span className="text-[9px] text-zinc-600">More</span>
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function MonthView({ activityMap }) {
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const monthTotals = useMemo(() =>
    months.map(({ year, month }) => {
      let total = 0;
      for (const [key, count] of Object.entries(activityMap)) {
        const d = parseLocalDate(key);
        if (d.getFullYear() === year && d.getMonth() === month) total += count;
      }
      return { year, month, total };
    }),
    [months, activityMap]
  );

  const maxVal = Math.max(...monthTotals.map((m) => m.total), 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-36 px-1">
        {monthTotals.map(({ year, month, total }, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({ dateKey: `${year}-${String(month + 1).padStart(2, "0")}-01`, count: total, label: `${MONTH_NAMES[month]} ${year}`, x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="text-[10px] text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{total}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(total / maxVal) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full rounded-t-lg ${getBarColor(total, maxVal)} group-hover:brightness-125 transition-all min-h-[2px]`}
              style={{ maxHeight: "100%" }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 px-1">
        {monthTotals.map(({ month }, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-zinc-600">{MONTH_NAMES[month].slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function WeekView({ activityMap }) {
  const days = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const result = [];
    for (let i = dayOfWeek; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i); result.push(toDateKey(d));
    }
    for (let i = dayOfWeek + 1; i < 7; i++) result.push(null);
    return result;
  }, []);

  const values = days.map((key) => (key ? activityMap[key] || 0 : null));
  const maxVal = Math.max(...values.filter((v) => v !== null), 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-40 px-2">
        {days.map((dateKey, i) => {
          const count = values[i];
          const isFuture = count === null;
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center gap-1 ${!isFuture ? "cursor-pointer group" : ""}`}
              onMouseEnter={(e) => {
                if (!isFuture && dateKey) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ dateKey, count, x: rect.left + rect.width / 2, y: rect.top });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {!isFuture && (
                <span className="text-[10px] text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: isFuture ? "4px" : `${Math.max((count / maxVal) * 100, count > 0 ? 4 : 2)}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-lg transition-all min-h-[2px] ${isFuture ? "bg-zinc-800/40 rounded-lg" : `${getBarColor(count, maxVal)} group-hover:brightness-125`}`}
                style={{ maxHeight: "100%" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 px-2">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className={`text-[9px] font-medium ${days[i] && toDateKey(new Date()) === days[i] ? "text-amber-400" : "text-zinc-600"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function DaysView({ activityMap }) {
  const days = useMemo(() => buildLastNDays(30), []);
  const values = days.map((key) => activityMap[key] || 0);
  const maxVal = Math.max(...values, 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-[3px] h-36 px-1">
        {days.map((dateKey, i) => {
          const count = values[i];
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center cursor-pointer group"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ dateKey, count, x: rect.left + rect.width / 2, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((count / maxVal) * 100, count > 0 ? 4 : 2)}%` }}
                transition={{ duration: 0.4, delay: i * 0.008, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-sm transition-all min-h-[2px] ${getBarColor(count, maxVal)} group-hover:brightness-125`}
                style={{ maxHeight: "100%" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center mt-2 px-1">
        {days.map((dateKey, i) => {
          const showLabel = i === 0 || i === 14 || i === 29;
          const d = parseLocalDate(dateKey);
          return (
            <div key={i} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[9px] text-zinc-600">
                  {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 bg-zinc-900/30 border border-amber-500/10 hover:border-amber-500/20 rounded-xl p-3.5 flex flex-col gap-1.5 transition-colors"
    >
      <div className="w-7 h-7 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.05)]">
        <Icon size={14} />
      </div>
      <div className="mt-0.5">
        <p className="text-lg font-extrabold text-zinc-100 leading-none">{value}</p>
        {subtitle && <p className="text-[10px] text-amber-400/80 font-bold mt-1 leading-none">{subtitle}</p>}
      </div>
      <p className="text-[10px] text-zinc-500 font-semibold leading-tight">{label}</p>
    </motion.div>
  );
}

// ─── View Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "year",  label: "Year" },
  { id: "month", label: "Month" },
  { id: "week",  label: "Week" },
  { id: "days",  label: "30 Days" },
];

// ─── Main Component ────────────────────────────────────────────────────────
export default function ActivityTracker() {
  const dispatch = useDispatch();
  const { activityMap, currentStreak, longestStreak, totalCompleted, isLoading } = useSelector(
    (state) => state.StreakSlice
  );

  const [activeView, setActiveView] = useState("year");

  useEffect(() => {
    dispatch(fetchStreakData());
  }, [dispatch]);

  const thisYearTotal = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return Object.entries(activityMap).reduce((sum, [key, count]) => {
      return parseLocalDate(key).getFullYear() === thisYear ? sum + count : sum;
    }, 0);
  }, [activityMap]);

  const bestDay = useMemo(() => {
    const { key, count } = getBestDay(activityMap);
    return key
      ? {
          count,
          date: parseLocalDate(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      : null;
  }, [activityMap]);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="border-b border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-amber-400" />
          <h2 className="text-lg font-bold text-zinc-100">Activity Tracker</h2>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">
          Track your consistency and stay on your streak.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Loading activity data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Streak Highlight (Duolingo-style) ── */}
          <StreakHighlightCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            activityMap={activityMap}
          />

          {/* ── Analytics Stats Row ── */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={CheckCircle2} label="Total Completed" value={totalCompleted} delay={0} />
            <StatCard icon={TrendingUp}   label="This Year"        value={thisYearTotal}  delay={0.06} />
            <StatCard
              icon={Calendar}
              label="Best Day"
              value={bestDay ? `${bestDay.count} task${bestDay.count !== 1 ? "s" : ""}` : "—"}
              subtitle={bestDay ? bestDay.date : undefined}
              delay={0.12}
            />
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none ${
                  activeView === tab.id
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-lg"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-0"
            >
              {activeView === "year"  && <YearHeatmap  activityMap={activityMap} />}
              {activeView === "month" && <MonthView    activityMap={activityMap} />}
              {activeView === "week"  && <WeekView     activityMap={activityMap} />}
              {activeView === "days"  && <DaysView     activityMap={activityMap} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
