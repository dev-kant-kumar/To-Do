import { RiLogoutBoxRFill } from "react-icons/ri";
import { IoPerson } from "react-icons/io5";
import { LayoutDashboard, Calendar, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearUserInfo } from "../Store/Reducers/UserSlice";
import { clearAuth } from "../utils/auth";
import { clearOfflineData } from "../utils/syncManager";

function AccountCenterDropDown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileHandler = () => {
    navigate("/profile");
  };

  const logoutHandler = async () => {
    try {
      await clearOfflineData();
    } catch (err) {
      console.error("Failed to clear offline databases:", err);
    }
    clearAuth();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
  };

  return (
    <div className="w-48 bg-zinc-950/95 border border-zinc-800/90 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl">
      <div className="flex flex-col gap-1">
        
        {/* Dashboard Link */}
        <button
          onClick={() => navigate("/home")}
          className="w-full flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900/60 transition-all text-sm font-medium focus:outline-none cursor-pointer"
        >
          <span>Dashboard</span>
          <LayoutDashboard className="text-zinc-500 hover:text-zinc-355" size={14} />
        </button>

        {/* Planner Link */}
        <button
          onClick={() => navigate("/planner")}
          className="w-full flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900/60 transition-all text-sm font-medium focus:outline-none cursor-pointer"
        >
          <span>Command Planner</span>
          <Calendar className="text-zinc-500 hover:text-zinc-355" size={14} />
        </button>

        {/* Profile Link */}
        <button
          onClick={profileHandler}
          className="w-full flex items-center justify-between px-3 py-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900/60 transition-all text-sm font-medium focus:outline-none cursor-pointer"
        >
          <span>Profile Settings</span>
          <IoPerson className="text-zinc-500 hover:text-zinc-300" size={14} />
        </button>

        <div className="border-t border-zinc-900/80 my-1"></div>

        <button
          onClick={logoutHandler}
          className="w-full flex items-center justify-between px-3 py-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/20 transition-all text-sm font-medium focus:outline-none cursor-pointer"
        >
          <span>Logout</span>
          <RiLogoutBoxRFill className="text-red-400/80" size={14} />
        </button>
      </div>
    </div>
  );
}

export default AccountCenterDropDown;
