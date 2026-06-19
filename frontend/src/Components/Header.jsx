import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Flame, Calendar, Menu, LayoutDashboard, User, Sparkles, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { setSearchQuery } from "../Store/Reducers/TodoFilterSlice";
import { fetchStreakData } from "../Store/Reducers/StreakSlice";
import { clearUserInfo } from "../Store/Reducers/UserSlice";
import { toast } from "react-toastify";
import { clearAuth } from "../utils/auth";
import AccountCenterDropDown from "./AccountCenterDropDown";
import StreakModal from "./StreakModal";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchQuery = useSelector((state) => state.TodoFilterSlice.searchQuery);
  const userInfo = useSelector((state) => state.UserSlice);
  const { currentStreak, longestStreak, activityMap } = useSelector(
    (state) => state.StreakSlice
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropDownRef = useRef(null);

  // Fetch streak data once user is authenticated
  useEffect(() => {
    if (userInfo?.userId) {
      dispatch(fetchStreakData());
    }
  }, [userInfo?.userId, dispatch]);

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
  };

  const handleLogout = () => {
    clearAuth();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`z-40 w-full sticky top-0 transition-all duration-300 ${
        isScrolled 
          ? "border-b border-purple-500/25 bg-zinc-950/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
          : "border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 transition-all duration-300 h-14 sm:h-16">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link to={userInfo?.userId ? "/home" : "/"} className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              ✓
            </span>
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-purple-400 transition-colors duration-200">
              todo<span className="text-purple-500">.</span>
            </span>
          </Link>

          {/* ── Search bar — hidden on mobile ─────────────────────────── */}
          <div className="hidden sm:block flex-grow max-w-md md:max-w-lg relative mx-auto">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <IoSearchOutline size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="w-full pl-11 pr-16 py-2.5 bg-zinc-900/10 border border-zinc-900 hover:border-zinc-800/80 focus:border-purple-500/30 focus:bg-zinc-950/20 focus:ring-4 focus:ring-purple-500/5 rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-zinc-500">
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-0.5 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  aria-label="Clear search"
                >
                  <RxCross2 size={15} />
                </button>
              )}
              <button
                className="p-0.5 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Search filters"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* ── Right actions ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Streak pill — desktop only (lg+) */}
            {userInfo?.userId && (
              <button
                onClick={() => setIsStreakModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold select-none shadow-inner hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-200 cursor-pointer focus:outline-none"
                title="View your streak details"
              >
                <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                <span>{currentStreak} day{currentStreak !== 1 ? "s" : ""}</span>
              </button>
            )}

            {/* Planner link — sm+ only */}
            {userInfo?.userId && (
              <Link
                to="/planner"
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white text-xs font-bold transition-all duration-200"
                title="Open Command Planner"
              >
                <Calendar size={13} className="text-purple-400" />
                <span className="hidden sm:inline">Planner</span>
              </Link>
            )}

            {/* Notification Bell — visible on all screen sizes */}
            {userInfo?.userId && (
              <NotificationBell />
            )}

            {/* Account avatar + dropdown — lg+ only */}
            <div className="hidden lg:flex items-center gap-4 relative" ref={dropDownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 text-zinc-300 hover:text-zinc-200 transition-all duration-200 select-none cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-300 font-bold text-sm shadow-sm select-none">
                  {userInfo.name
                    ? userInfo.name.charAt(0).toUpperCase()
                    : userInfo.username
                      ? userInfo.username.charAt(0).toUpperCase()
                      : "U"}
                </div>
                <span className="text-xs font-semibold max-w-[120px] truncate">
                  {userInfo.name || userInfo.username || "User"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-purple-400" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="account-dropdown"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 z-50 origin-top-right"
                  >
                    <AccountCenterDropDown />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger — visible at sm..lg (bottom nav covers < sm) */}
            {userInfo?.userId && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden sm:flex lg:hidden items-center justify-center p-2 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all duration-200 cursor-pointer focus:outline-none"
                title="Open navigation menu"
              >
                <Menu size={16} />
              </button>
            )}
          </div>
        </div>
      </header>


      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        activityMap={activityMap}
      />

      {/* Mobile Navigation Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sidebar Content Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-72 sm:w-80 bg-zinc-950/95 border-l border-zinc-900/80 backdrop-blur-xl z-50 shadow-2xl flex flex-col justify-between lg:hidden text-left"
            >
              {/* Top Section */}
              <div className="p-5 flex flex-col gap-6">
                {/* Header (Title and Close Button) */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-md tracking-tight">
                    todo<span className="text-purple-500">.</span> Navigation
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <RxCross2 size={16} />
                  </button>
                </div>

                {/* User Info Profile Card */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/20 border border-zinc-900/60">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-base shadow-inner">
                    {userInfo.name
                      ? userInfo.name.charAt(0).toUpperCase()
                      : userInfo.username
                        ? userInfo.username.charAt(0).toUpperCase()
                        : "U"}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-xs font-bold text-zinc-100 truncate">
                      {userInfo.name || userInfo.username || "User"}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {userInfo.email || "No email linked"}
                    </p>
                  </div>
                </div>

                {/* Mobile search — only visible below sm where header search is hidden */}
                <div className="sm:hidden relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <IoSearchOutline size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tasks..."
                    className="w-full pl-9 pr-9 py-2.5 bg-zinc-900/40 border border-zinc-800/60 focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/5 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { handleClearSearch(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <RxCross2 size={14} />
                    </button>
                  )}
                </div>

                {/* Navigation Menu Links */}

                <div className="flex flex-col gap-1.5 mt-2">
                  <Link
                    to="/home"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900/50 transition-all text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard size={15} className="text-zinc-500" />
                      <span>Dashboard</span>
                    </span>
                  </Link>

                  <Link
                    to="/planner"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900/50 transition-all text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      <Calendar size={15} className="text-zinc-500" />
                      <span>Command Planner</span>
                    </span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900/50 transition-all text-xs font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      <User size={15} className="text-zinc-500" />
                      <span>Profile Settings</span>
                    </span>
                  </Link>
                  

                </div>
              </div>

              {/* Bottom Section */}
              <div className="p-5 border-t border-zinc-900/80 flex flex-col gap-4">
                {/* Streak status — tappable, opens StreakModal */}
                <button
                  onClick={() => { setIsSidebarOpen(false); setIsStreakModalOpen(true); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-zinc-400">Current Streak</span>
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span>{currentStreak} day{currentStreak !== 1 ? "s" : ""}</span>
                  </div>
                </button>


                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-950 bg-red-950/20 text-red-400 hover:bg-red-900/20 hover:border-red-900/40 text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Log Out Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
