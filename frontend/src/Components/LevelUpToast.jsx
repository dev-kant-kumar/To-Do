/**
 * LevelUpToast.jsx
 * ─────────────────────────────────────────────────────────────────
 * Animated level-up celebration toast.
 * Listens for the custom event "todo-level-up" dispatched by StreakSlice / XP logic.
 * Renders a full-screen overlay celebration + a sticky banner.
 */
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star, X } from "lucide-react";
import { getLevelInfo, getTierGradient } from "../utils/gamificationUtils";

function Particle({ x, y, color, size, delay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: color,
        filter: "blur(0.5px)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        y: [0, -80, -140],
        x: [(Math.random() - 0.5) * 60],
      }}
      transition={{ duration: 1.8, delay, ease: "easeOut" }}
    />
  );
}

export default function LevelUpToast() {
  const [event, setEvent] = useState(null);

  const handleLevelUp = useCallback((e) => {
    setEvent(e.detail);
    setTimeout(() => setEvent(null), 4500);
  }, []);

  useEffect(() => {
    window.addEventListener("todo-level-up", handleLevelUp);
    return () => window.removeEventListener("todo-level-up", handleLevelUp);
  }, [handleLevelUp]);

  if (!event) return null;

  const { level, levelTitle } = event;
  const tierStyle = getTierGradient(getLevelInfo(level).tier);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#fbbf24" : "#34d399",
    size: Math.random() * 6 + 3,
    delay: Math.random() * 0.5,
  }));

  return createPortal(
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed top-20 right-4 z-[9999] max-w-sm w-full pointer-events-auto"
          initial={{ opacity: 0, x: 80, scale: 0.85 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden border"
            style={{
              background: "rgba(9, 9, 11, 0.97)",
              borderColor: `${tierStyle.glow.replace("0.5", "0.4")}`,
              boxShadow: `0 0 40px ${tierStyle.glow}, 0 20px 60px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Particle burst */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <Particle key={i} {...p} />
              ))}
            </div>

            {/* Top gradient bar */}
            <div
              className={`h-1 w-full bg-gradient-to-r ${tierStyle.gradient}`}
            />

            <div className="relative p-4 flex items-center gap-4">
              {/* Level badge */}
              <motion.div
                className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center text-2xl font-black text-black shadow-xl`}
                style={{ boxShadow: `0 0 20px ${tierStyle.glow}` }}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
              >
                {level}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "linear" }}
                />
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="flex items-center gap-1.5 mb-0.5"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-400">
                    Level Up!
                  </span>
                </motion.div>

                <motion.p
                  className="text-base font-black text-zinc-100 leading-tight"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  You reached{" "}
                  <span
                    className={`bg-gradient-to-r ${tierStyle.gradient} bg-clip-text text-transparent`}
                  >
                    {levelTitle}
                  </span>
                </motion.p>

                <motion.div
                  className="flex items-center gap-1 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {[...Array(Math.min(level, 5))].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.35 + i * 0.06, type: "spring", stiffness: 400 }}
                    >
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Close */}
              <button
                onClick={() => setEvent(null)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto-dismiss progress bar */}
            <motion.div
              className={`h-0.5 bg-gradient-to-r ${tierStyle.gradient} origin-left`}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
