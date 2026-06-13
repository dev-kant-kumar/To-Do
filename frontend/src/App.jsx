import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "react-toastify";
import Header from "./Components/Header";
import Filters from "./Components/Filters";
import Projects from "./Components/Projects";
import Tasks from "./Components/Tasks";
import { clearUserInfo } from "./Store/Reducers/UserSlice";

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.UserSlice);

  const closeHandler = () => {
    setShowFilters(false);
  };

  const logoutHandler = () => {
    localStorage.clear();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
  };

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
        {/* Left Filters Sidebar */}
        <section
          className={`w-full md:w-64 flex-shrink-0 bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl transition-all duration-300 md:flex md:h-[620px] flex flex-col justify-between ${
            showFilters ? "block fixed inset-x-4 top-24 bottom-6 z-50 bg-zinc-950 border-zinc-700/80" : "hidden"
          }`}
        >
          {/* Top Content (Filters & Projects) */}
          <div className="flex flex-col gap-5 overflow-y-auto scrollbar-none flex-grow">
            <Filters setShow={setShowFilters} />
            <Projects />
          </div>

          {/* Bottom user info and logout */}
          <div className="border-t border-zinc-900/60 pt-4 mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 bg-zinc-900/20 border border-zinc-900/40 rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-purple-950/30 flex-shrink-0">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : (userInfo.username ? userInfo.username.charAt(0).toUpperCase() : "U")}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-sm font-bold text-zinc-200 truncate">{userInfo.name || userInfo.username || "User"}</span>
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
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-800 transition-colors md:hidden text-sm"
              >
                Apply Filters
              </button>
            )}
          </div>
        </section>

        {/* Right Tasks Area */}
        <section className="flex-grow w-full bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl md:h-[620px] flex flex-col">
          <Tasks />
        </section>
      </main>
    </div>
  );
}

export default App;
