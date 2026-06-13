import { useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import DropDown from "./AccountCenterDropDown";
import { IoReorderThreeOutline, IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { SlidersHorizontal } from "lucide-react";
import { setSearchQuery } from "../Store/Reducers/TodoFilterSlice";

function Header(props) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.UserSlice);
  const searchQuery = useSelector((state) => state.TodoFilterSlice.searchQuery);
  const [showDropDown, setShowDropDown] = useState(false);
  const dropDownRef = useRef();

  const closeHandler = () => {
    props.setShow(true);
  };

  const dropDownHandler = () => {
    setShowDropDown(!showDropDown);
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(""));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setShowDropDown(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative z-40 w-full border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle button */}
        <div className="flex items-center md:hidden flex-shrink-0">
          <button
            onClick={closeHandler}
            aria-label="Open sidebar filters"
            className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
          >
            <IoReorderThreeOutline size={28} />
          </button>
        </div>

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
        <div className="flex-grow max-w-md md:max-w-lg relative mx-2">
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

        {/* Account Center Profile dropdown wrapper */}
        <div className="relative flex-shrink-0" ref={dropDownRef}>
          <button
            onClick={dropDownHandler}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300 transition-all text-sm font-medium focus:outline-none"
          >
            <span>{userInfo?.name || "User"}</span>
            <IoMdArrowDropdown size={16} className={`text-zinc-500 transition-transform duration-200 ${showDropDown ? "rotate-180" : ""}`} />
          </button>
          
          {showDropDown && <DropDown />}
        </div>
      </div>
    </header>
  );
}

export default Header;



