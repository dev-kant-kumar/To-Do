import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Calendar,
  User,
  Flame,
  LogOut,
  Settings,
  ChevronRight,
  X,
  Target,
  TrendingUp,
  Plus,
} from "lucide-react";
import { clearAuth } from "../utils/auth";
import { clearUserInfo } from "../Store/Reducers/UserSlice";
import { toast } from "react-toastify";
import { clearOfflineData } from "../utils/syncManager";
import { setShowCreateTask } from "../Store/Reducers/TodoFilterSlice";

// ─── Me bottom sheet ──────────────────────────────────────────────────────────

function MeSheet({ open, onClose, todayStats, currentStreak, longestStreak }) {
  const userInfo = useSelector((s) => s.UserSlice);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await clearOfflineData();
    } catch (err) {
      console.error("Failed to clear offline databases:", err);
    }
    clearAuth();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="me-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            key="me-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-zinc-950 border-t border-zinc-800/70 rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}
          >
            {/* Pull handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* User card */}
            <div className="mx-4 mt-2 mb-4 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="w-11 h-11 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-300 font-black text-lg">
                {userInfo.name
                  ? userInfo.name.charAt(0).toUpperCase()
                  : userInfo.username
                  ? userInfo.username.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-100 truncate">
                  {userInfo.name || userInfo.username || "User"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {userInfo.email || "No email linked"}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mx-4 grid grid-cols-2 gap-3 mb-4">
              {/* Streak */}
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/70">
                    Streak
                  </span>
                </div>
                <p className="text-2xl font-black text-amber-400 leading-none">
                  {currentStreak}
                  <span className="text-sm font-bold ml-1">day{currentStreak !== 1 ? "s" : ""}</span>
                </p>
                <p className="text-[10px] text-zinc-500">Best: {longestStreak} days</p>
              </div>

              {/* Daily progress */}
              {!todayStats.loading && todayStats.total > 0 ? (
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-purple-500/5 border border-purple-500/15">
                  <div className="flex items-center gap-1.5">
                    <Target size={13} className="text-purple-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400/70">
                      Today
                    </span>
                  </div>
                  <p className="text-2xl font-black text-purple-300 leading-none">
                    {todayStats.percent}
                    <span className="text-sm font-bold">%</span>
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {todayStats.completed}/{todayStats.total} done
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/40">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-zinc-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600">
                      Today
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500 mt-1">No tasks yet</p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="mx-4 flex flex-col gap-1.5 mb-4">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:bg-zinc-900/70 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300">
                  <Settings size={14} className="text-zinc-500" />
                  Account Settings
                </span>
                <ChevronRight size={14} className="text-zinc-600" />
              </Link>


            </div>

            {/* Logout */}
            <div className="mx-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-950 bg-red-950/20 text-red-400 hover:bg-red-900/20 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out Session</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main bottom nav ──────────────────────────────────────────────────────────

export default function MobileNav({ todayStats, currentStreak, longestStreak }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const [meOpen, setMeOpen] = useState(false);

  // Close Me sheet on route change
  useEffect(() => {
    setMeOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/home" || location.pathname === "/";
  const isPlanner = location.pathname === "/planner";
  const isSettings = location.pathname === "/profile";

  const navItem = (active) =>
    `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all duration-200 select-none cursor-pointer ${
      active
        ? "text-purple-300"
        : "text-zinc-500 hover:text-zinc-300"
    }`;

  return (
    <>
      {/* Bottom nav bar — lg:hidden */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 max-w-sm mx-auto px-2">

          {/* Home */}
          <Link to="/home" className={navItem(isHome)}>
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${isHome ? "bg-purple-500/15" : ""}`}>
              <Home size={20} strokeWidth={isHome ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          {/* Planner */}
          <Link to="/planner" className={navItem(isPlanner)}>
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${isPlanner ? "bg-purple-500/15" : ""}`}>
              <Calendar size={20} strokeWidth={isPlanner ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-bold">Planner</span>
          </Link>

          {/* Add Task button in bottom nav */}
          <button onClick={() => dispatch(setShowCreateTask(true))} className={navItem(false)}>
            <div className="p-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40 transition-all duration-200 active:scale-95 flex items-center justify-center">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold">Add</span>
          </button>

          {/* Settings */}
          <Link to="/profile" className={navItem(isSettings)}>
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${isSettings ? "bg-purple-500/15" : ""}`}>
              <Settings size={20} strokeWidth={isSettings ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-bold">Settings</span>
          </Link>

          {/* Me */}
          <button onClick={() => setMeOpen(true)} className={navItem(meOpen)}>
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${meOpen ? "bg-purple-500/15" : ""}`}>
              <User size={20} strokeWidth={meOpen ? 2.5 : 1.8} />
            </div>
            <span className="text-[10px] font-bold">Me</span>
          </button>
        </div>
      </nav>

      {/* Me bottom sheet */}
      <MeSheet
        open={meOpen}
        onClose={() => setMeOpen(false)}
        todayStats={todayStats}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />
    </>
  );
}
