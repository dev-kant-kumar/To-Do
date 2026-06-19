import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "./Components/Header";
import Tasks from "./Components/Tasks";
import { fetchStreakData } from "./Store/Reducers/StreakSlice";
import { StreakHighlightCard } from "./Components/ActivityTracker";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  const { currentStreak, longestStreak, activityMap } = useSelector(
    (state) => state.StreakSlice
  );

  const [todayStats, setTodayStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    percent: 0,
    loading: true,
  });

  const fetchTodayStats = useCallback(async () => {
    if (!userInfo?.userId) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}filters/today`, {
        userId: userInfo.userId,
      });
      if (res.data && Array.isArray(res.data)) {
        const total = res.data.length;
        const completed = res.data.filter((t) => t.completed).length;
        const pending = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        setTodayStats({ total, completed, pending, percent, loading: false });
      } else {
        setTodayStats({ total: 0, completed: 0, pending: 0, percent: 0, loading: false });
      }
    } catch (err) {
      console.error("Error fetching today's stats:", err);
      setTodayStats({ total: 0, completed: 0, pending: 0, percent: 0, loading: false });
    }
  }, [userInfo?.userId]);

  // Fetch streak & stats on mount and when todo changes
  useEffect(() => {
    if (userInfo?.userId) {
      dispatch(fetchStreakData());
      fetchTodayStats();
    }
  }, [userInfo?.userId, dispatch, fetchTodayStats, todoData.todo]);

  const renderMorningIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="relative z-10">
      <defs>
        <linearGradient id="morningSun" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="morningSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#morningSky)" />
      <motion.circle
        cx="50"
        cy="48"
        r="18"
        fill="url(#morningSun)"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
      />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50px", originY: "48px" }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + 24 * Math.cos(angle);
          const y1 = 48 + 24 * Math.sin(angle);
          const x2 = 50 + 30 * Math.cos(angle);
          const y2 = 48 + 30 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}
      </motion.g>
      <motion.path
        d="M25 65h35a10 10 0 0 0 0-20 8 8 0 0 0-14-6 12 12 0 0 0-21 6 10 10 0 0 0 0 20Z"
        fill="#1f1f23"
        fillOpacity="0.8"
        stroke="#3f3f46"
        strokeWidth="1.5"
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );

  const renderAfternoonIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="relative z-10">
      <defs>
        <linearGradient id="afternoonSun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="afternoonSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#afternoonSky)" />
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        fill="url(#afternoonSun)"
        animate={{ scale: [1, 1.08, 1], y: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_20px_rgba(234,88,12,0.65)]"
      />
      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ originX: "50px", originY: "50px" }}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x1 = 50 + 26 * Math.cos(angle);
          const y1 = 50 + 26 * Math.sin(angle);
          const x2 = 50 + 34 * Math.cos(angle);
          const y2 = 50 + 34 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ea580c"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
          );
        })}
      </motion.g>
    </svg>
  );

  const renderEveningIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="relative z-10">
      <defs>
        <linearGradient id="eveningSun" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="eveningSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#eveningSky)" />
      <line x1="20" y1="65" x2="80" y2="65" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
      <motion.path
        d="M32 65 A 18 18 0 0 1 68 65 Z"
        fill="url(#eveningSun)"
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_15px_rgba(244,63,94,0.55)]"
      />
      <motion.path
        d="M15 52h20a6 6 0 0 0 0-12 5 5 0 0 0-8-4 7 7 0 0 0-12 6c0 3 0 10 0 10Z"
        fill="#1f1f23"
        fillOpacity="0.65"
        stroke="#3f3f46"
        strokeWidth="1"
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );

  const renderNightIllustration = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="relative z-10">
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="nightSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#nightSky)" />
      <g>
        <motion.circle cx="30" cy="30" r="1.5" fill="#fff" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="75" cy="40" r="1.2" fill="#fff" animate={{ opacity: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
        <motion.circle cx="60" cy="20" r="1.8" fill="#fff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      </g>
      <motion.path
        d="M60 55 A 18 18 0 1 1 50 32 A 14 14 0 1 0 60 55 Z"
        fill="url(#moonGrad)"
        animate={{ rotate: [-2, 2, -2], y: [-1, 1, -1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_12px_rgba(226,232,240,0.5)]"
      />
    </svg>
  );

  const getGreetingData = () => {
    const hr = new Date().getHours();
    const name = userInfo.name || userInfo.username || "Dev Kant Kumar";
    
    let timeGreeting = "Up late";
    let glowColor = "rgba(99, 102, 241, 0.08)"; // indigo
    
    if (hr >= 5 && hr < 12) {
      timeGreeting = "Good morning";
      glowColor = "rgba(251, 191, 36, 0.06)"; // amber
    } else if (hr >= 12 && hr < 17) {
      timeGreeting = "Good afternoon";
      glowColor = "rgba(245, 158, 11, 0.06)"; // orange
    } else if (hr >= 17 && hr < 22) {
      timeGreeting = "Good evening";
      glowColor = "rgba(236, 72, 153, 0.06)"; // pink
    }
    
    return { timeGreeting, name, glowColor, hr };
  };

  const renderGreetingIllustration = (hr) => {
    if (hr >= 5 && hr < 12) {
      return renderMorningIllustration();
    } else if (hr >= 12 && hr < 17) {
      return renderAfternoonIllustration();
    } else if (hr >= 17 && hr < 22) {
      return renderEveningIllustration();
    } else {
      return renderNightIllustration();
    }
  };

  const { timeGreeting, name, glowColor, hr } = getGreetingData();

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col overflow-x-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      <Header />

      {/* Main Container */}
      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Dynamic Greeting Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-3xl border border-zinc-900 bg-[#0e0e11]/80 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]"
        >
          {/* Cyber Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Time-of-day specific radial glow */}
          <div 
            className="absolute top-0 right-0 w-96 h-full pointer-events-none select-none"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${glowColor}, transparent 65%)`
            }}
          />
          
          <div className="flex-1 text-left relative z-10 flex flex-col gap-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-purple-400">
                {timeGreeting}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none mt-1">
                {name}
              </h1>
            </div>
            
            {todayStats.loading ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3.5 h-3.5 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-xs text-zinc-500">Checking your schedule...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1 flex-wrap">
                {todayStats.total > 0 ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-300 bg-zinc-900/60 px-2.5 py-1 rounded-full border border-zinc-800/80 shadow-sm">
                      <span className={`w-2 h-2 rounded-full ${todayStats.pending === 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'} animate-pulse`} />
                      {todayStats.pending === 0 
                        ? "All tasks cleared" 
                        : `${todayStats.pending} pending task${todayStats.pending !== 1 ? 's' : ''}`
                      }
                    </span>
                    <span className="text-xs md:text-sm font-medium text-zinc-400 leading-relaxed flex items-center gap-1.5 flex-wrap">
                      {todayStats.pending === 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span>Excellent work! You're completely caught up for today.</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 animate-bounce ml-0.5 inline-block align-text-bottom">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <span>out of {todayStats.total} scheduled today. Let's check them off!</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 animate-pulse ml-0.5 inline-block align-text-bottom">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-xs md:text-sm font-medium text-zinc-500 flex items-center gap-1.5">
                    <span>No tasks scheduled for today. Ready to plan some?</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 animate-pulse ml-0.5 inline-block align-text-bottom">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                )}
              </div>
            )}
          </div>          

          {/* Time-of-day illustration container */}
          <div className="flex-shrink-0 relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-zinc-900/20 border border-zinc-800/40 backdrop-blur-md flex items-center justify-center p-3 shadow-inner shadow-white/5">
            {renderGreetingIllustration(hr)}
          </div>
          
        </motion.div>

        {/* Dashboard Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left Column (65% width) - Tasks List */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow w-full lg:w-[65%] bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-2xl lg:h-[620px] flex flex-col"
          >
            <Tasks />
          </motion.section>

          {/* Right Column (35% width) - Gamified Streak and Milestone Progress */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6"
          >
            {/* Daily Progress Card */}
            {!todayStats.loading && todayStats.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-2xl overflow-hidden border border-purple-500/15 relative"
                style={{ background: "linear-gradient(135deg, #111113 0%, #0e0e10 100%)" }}
              >
                {/* Purple radial glow */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 75%)" }}
                />
                
                <div className="relative p-5 flex flex-col gap-4 text-left">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Daily Focus</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/30 text-purple-400 border border-purple-900/30">
                      Today
                    </span>
                  </div>

                  {/* Main Illustration Area (Horizontal Layout) */}
                  <div className="flex items-center gap-5">
                    {/* Premium Custom SVG Illustration */}
                    <div className="relative flex-shrink-0 w-20 h-20">
                      {/* Circular Gauge Background Glow */}
                      <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-md" />
                      
                      <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-90 relative z-10">
                        <defs>
                          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        
                        {/* Track ring */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#1f1f23"
                          strokeWidth="6"
                          fill="none"
                        />
                        
                        {/* Progress ring */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="url(#progressGrad)"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="264" // 2 * pi * 42 = ~263.89
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * todayStats.percent) / 100 }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          filter="url(#glow)"
                        />
                      </svg>

                      {/* Icon inside the circle */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {todayStats.percent === 100 ? (
                          // Premium Trophy Icon (100% complete)
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7v2h10v-2h-2c-.55 0-1-.45-1-1v-2.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 2a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </motion.div>
                        ) : (
                          // Premium Target/Focus SVG Icon
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
                              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Description */}
                    <div className="flex-grow flex flex-col justify-center min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-white tracking-tight">{todayStats.percent}%</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">completed</span>
                      </div>
                      
                      <div className="text-[11px] font-semibold text-zinc-400 mt-1 truncate">
                        {todayStats.completed} of {todayStats.total} tasks completed
                      </div>

                      {/* Motivational subtext */}
                      <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-relaxed italic">
                        {todayStats.percent === 100 
                          ? "Maximum focus achieved! 🌟" 
                          : todayStats.percent >= 50 
                            ? "Over halfway done! Finish strong! 🚀" 
                            : "Every completed task is a win! 💪"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <StreakHighlightCard
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              activityMap={activityMap}
            />
          </motion.section>
        </div>

      </main>
    </div>
  );
}

export default App;
