import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { SlidersHorizontal, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setSearchQuery } from "../Store/Reducers/TodoFilterSlice";
import AccountCenterDropDown from "./AccountCenterDropDown";

function Header(props) {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.TodoFilterSlice.searchQuery);
  const userInfo = useSelector((state) => state.UserSlice);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef(null);

  const closeHandler = () => {
    props.setShow(true);
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
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

  return (
    <header className="relative z-40 w-full border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
            ✓
          </span>
          <span className="font-extrabold text-white text-lg tracking-tight group-hover:text-purple-400 transition-colors duration-200">
            todo<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* Search Bar - Center Pill shape */}
        <div className="hidden sm:block flex-grow max-w-md md:max-w-lg relative mx-2">
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
                className="p-0.5 rounded hover:bg-zinc-800 hover:text-zinc-350 transition-colors"
                aria-label="Clear search"
              >
                <RxCross2 size={15} />
              </button>
            )}
            <button
              className="p-0.5 rounded hover:bg-zinc-800 hover:text-zinc-350 transition-colors cursor-pointer"
              title="Search filters"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Right actions - Desktop only */}
        <div className="hidden md:flex items-center gap-4 relative" ref={dropDownRef}>
          {/* Cloud Sync Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/15 border border-emerald-900/20 text-[10px] font-bold text-emerald-400 select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Cloud Sync</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 text-zinc-300 hover:text-zinc-200 transition-all duration-200 select-none cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-300 font-bold text-sm shadow-sm select-none">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : (userInfo.username ? userInfo.username.charAt(0).toUpperCase() : "U")}
            </div>
            <span className="text-xs font-semibold max-w-[120px] truncate">
              {userInfo.name || userInfo.username || "User"}
            </span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-purple-400" : ""}`} />
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

        {/* Right Actions Wrapper (Hamburger) */}
        <div className="flex items-center gap-3 flex-shrink-0 md:hidden">
          {/* Mobile Menu Toggle button */}
          <div className="flex items-center">
            <button
              onClick={closeHandler}
              aria-label="Open sidebar filters"
              className="p-2.5 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all duration-200 active:scale-95 focus:outline-none"
            >
              <Menu size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;



