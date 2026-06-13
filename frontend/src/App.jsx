import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Components/Header";
import Filters from "./Components/Filters";
import Projects from "./Components/Projects";
import Tasks from "./Components/Tasks";
import { clearUserInfo } from "./Store/Reducers/UserSlice";

function App() {
  const [showFilters, setShowFilters] = useState(false);
  // Initialise synchronously so there's no flash on first render
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.UserSlice);

  // Keep in sync when window resizes across the breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const closeHandler = () => {
    setShowFilters(false);
  };

  const logoutHandler = () => {
    localStorage.clear();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
  };

  // On desktop the sidebar animates in on mount then stays; on mobile it slides in from the right
  const sidebarAnimate = isDesktop
    ? { x: 0, opacity: 1, pointerEvents: "auto" }
    : showFilters
    ? { x: 0, opacity: 1, pointerEvents: "auto" }
    : { x: "calc(100% + 20px)", opacity: 0, pointerEvents: "none" };

  const sidebarInitial = isDesktop
    ? { x: -24, opacity: 0 }
    : false;

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col overflow-x-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      <Header setShow={setShowFilters} />

      {/* Main Container */}
      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 items-start">
        {/* Mobile Backdrop Overlay */}
        <AnimatePresence>
          {showFilters && !isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs z-40"
              onClick={closeHandler}
            />
          )}
        </AnimatePresence>

        {/* Left Filters Sidebar */}
        <motion.section
          initial={sidebarInitial}
          animate={sidebarAnimate}
          transition={
            isDesktop
              ? { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
              : { type: "spring", stiffness: 320, damping: 32 }
          }
          className="bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden fixed md:static top-24 bottom-6 right-4 w-64 md:w-80 z-50 md:z-0 md:h-[620px]"
        >
          {/* Top Content (Filters & Projects) */}
          <div className="flex flex-col gap-5 overflow-y-auto scrollbar-none flex-grow">
            <Filters setShow={setShowFilters} />
            <Projects />
          </div>

          {/* Bottom user info and actions */}
          <div className="border-t border-zinc-900/60 pt-4 mt-4 flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3 bg-zinc-900/20 border border-zinc-900/40 rounded-xl p-3">
              <div 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 min-w-0 cursor-pointer group/user select-none"
                title="View Profile Settings"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-300 font-bold text-base shadow-sm flex-shrink-0 group-hover/user:scale-[1.03] transition-all duration-200">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : (userInfo.username ? userInfo.username.charAt(0).toUpperCase() : "U")}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-sm font-bold text-zinc-200 truncate group-hover/user:text-purple-400 transition-colors">{userInfo.name || userInfo.username || "User"}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{userInfo.email || "No email"}</span>
                </div>
              </div>
              <button 
                onClick={logoutHandler}
                className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-400 hover:text-red-300 transition-all flex-shrink-0 cursor-pointer focus:outline-none"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>

            {showFilters && (
              <button
                onClick={closeHandler}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-800 transition-colors md:hidden text-sm cursor-pointer"
              >
                Apply Filters
              </button>
            )}
          </div>
        </motion.section>

        {/* Right Tasks Area */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: isDesktop ? 0.12 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="flex-grow w-full bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl md:h-[620px] flex flex-col"
        >
          <Tasks />
        </motion.section>
      </main>
    </div>
  );
}

export default App;
