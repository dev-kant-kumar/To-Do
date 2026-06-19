import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Milestone definitions ─────────────────────────────────────────────────
const MILESTONES = [
  { days: 3,   badge: "Starter Spark",      emoji: "✨" },
  { days: 7,   badge: "Week Warrior",        emoji: "🏆" },
  { days: 14,  badge: "Fortnight Force",     emoji: "⚡" },
  { days: 30,  badge: "Monthly Master",      emoji: "💎" },
  { days: 100, badge: "Century Centurion",   emoji: "🔱" },
  { days: 365, badge: "Legendary Streak",    emoji: "👑" },
];

function getMilestoneContext(streak) {
  // Find the previous milestone (already passed) and next milestone (coming up)
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

// ─── Helper: build current week (Mon → Sun) ────────────────────────────────
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildCurrentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun

  // Monday-anchored week: go back to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEK_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ─── Count-up animation hook ───────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Animated Flame SVG ───────────────────────────────────────────────────
function FlameIcon({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="flameGlow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flameGrad" x1="30" y1="80" x2="30" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="innerFlameGrad" x1="30" y1="80" x2="30" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Glow behind flame */}
      <ellipse cx="30" cy="72" rx="24" ry="8" fill="url(#flameGlow)" />
      {/* Main flame body */}
      <path
        d="M30 8 C30 8 14 28 14 46 C14 56 20 66 30 68 C40 66 46 56 46 46 C46 28 30 8 30 8Z"
        fill="url(#flameGrad)"
      />
      {/* Inner bright core */}
      <path
        d="M30 30 C30 30 22 42 22 52 C22 58 25 63 30 64 C35 63 38 58 38 52 C38 42 30 30 30 30Z"
        fill="url(#innerFlameGrad)"
      />
      {/* Spark dots */}
      <circle cx="42" cy="22" r="3" fill="#fef08a" opacity="0.8" />
      <circle cx="18" cy="16" r="2" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────
function MilestoneProgressBar({ streak }) {
  const { prevMilestone, nextMilestone, progress } = getMilestoneContext(streak);

  // Show at most 4 visible milestones around current position
  const relevantMilestones = MILESTONES.filter(
    (m) => m.days <= (nextMilestone ? nextMilestone.days : 999)
  ).slice(-3);

  return (
    <div className="w-full px-2">
      <div className="flex items-center gap-0 w-full">
        {/* Start dot */}
        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] flex-shrink-0 z-10" />

        {/* Progress track */}
        <div className="flex-1 relative h-2 bg-zinc-800 rounded-full mx-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.5)]"
          />
          {/* Current position dot on track */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `calc(${progress * 100}% - 6px)` }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
          />
        </div>

        {/* Next milestone dot */}
        {nextMilestone && (
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 border border-zinc-600 flex-shrink-0" />
        )}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] text-amber-400 font-bold">{prevMilestone.days}d</span>
        {nextMilestone && (
          <span className="text-[10px] text-zinc-500 font-semibold">{nextMilestone.days}d</span>
        )}
      </div>

      {/* Motivational message */}
      {nextMilestone && (
        <p className="text-center text-xs text-zinc-400 mt-3 leading-relaxed px-2">
          Stay faithful and reach{" "}
          <span className="text-amber-400 font-bold">{nextMilestone.days} days</span>
          {" "}— unlock your{" "}
          <span className="text-amber-300 font-bold">
            {nextMilestone.emoji} {nextMilestone.badge}
          </span>{" "}
          badge!
        </p>
      )}
      {!nextMilestone && (
        <p className="text-center text-xs text-amber-300 mt-3 font-bold">
          👑 You've achieved Legendary Streak status!
        </p>
      )}
    </div>
  );
}

// ─── Weekly Strip ─────────────────────────────────────────────────────────
function WeekStrip({ activityMap }) {
  const weekDays = useMemo(() => buildCurrentWeek(), []);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {/* Day labels */}
        {WEEK_LABELS.map((label, i) => {
          const isToday = weekDays[i].getTime() === today.getTime();
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-bold ${isToday ? "text-amber-400" : "text-zinc-500"}`}>
                {label}
              </span>
              {/* Day circle */}
              {(() => {
                const dateKey = toDateKey(weekDays[i]);
                const hasActivity = activityMap[dateKey] && activityMap[dateKey] > 0;
                const isFuture = weekDays[i].getTime() > today.getTime();

                if (hasActivity) {
                  return (
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 400 }}
                      className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                    >
                      <span className="text-base leading-none">🔥</span>
                    </motion.div>
                  );
                } else if (isToday) {
                  return (
                    <div className="w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">{weekDays[i].getDate()}</span>
                    </div>
                  );
                } else if (isFuture) {
                  return (
                    <div className="w-9 h-9 rounded-full border border-zinc-700/40 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-600">{weekDays[i].getDate()}</span>
                    </div>
                  );
                } else {
                  // Past, no activity
                  return (
                    <div className="w-9 h-9 rounded-full border-2 border-zinc-700 bg-zinc-800/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-500">{weekDays[i].getDate()}</span>
                    </div>
                  );
                }
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Modal Component ─────────────────────────────────────────────────
export default function StreakModal({ isOpen, onClose, currentStreak, longestStreak, activityMap }) {
  const animatedCount = useCountUp(isOpen ? currentStreak : 0, 900);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="streak-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            key="streak-card"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.05 }}
            className="relative w-full max-w-[360px] rounded-[2rem] overflow-hidden z-10 shadow-2xl"
            style={{ background: "linear-gradient(160deg, #111113 0%, #0a0a0c 100%)" }}
          >
            {/* Radial amber glow behind flame */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)" }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all focus:outline-none cursor-pointer z-20"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-5">
              {/* Animated Flame */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-2"
              >
                <FlameIcon size={80} />
              </motion.div>

              {/* Streak count */}
              <div className="flex flex-col items-center gap-0.5 -mt-1">
                <motion.span
                  className="text-6xl font-black leading-none"
                  style={{
                    background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 60%, #d97706 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {animatedCount}
                </motion.span>
                <span className="text-lg font-bold text-amber-400/90 tracking-wide">
                  day streak
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-zinc-800/80" />

              {/* Milestone Progress Bar */}
              <MilestoneProgressBar streak={currentStreak} />

              {/* Divider */}
              <div className="w-full h-px bg-zinc-800/80" />

              {/* Weekly Strip */}
              <div className="w-full">
                <WeekStrip activityMap={activityMap} />
              </div>

              {/* Stats row */}
              <div className="flex w-full gap-3">
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Current</p>
                  <p className="text-xl font-black text-amber-400 mt-1">{currentStreak}d</p>
                </div>
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Longest</p>
                  <p className="text-xl font-black text-zinc-200 mt-1">{longestStreak}d</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col w-full gap-2.5">
                {/* Primary: Continue */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-zinc-950 cursor-pointer focus:outline-none shadow-lg"
                  style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
                >
                  Continue
                </motion.button>
                {/* Secondary: View Full Stats */}
                <Link
                  to="/profile?tab=activity"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-amber-400 hover:text-amber-300 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all focus:outline-none"
                >
                  View Full Stats →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
