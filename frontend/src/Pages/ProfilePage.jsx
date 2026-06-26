import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../Components/Header";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ConfirmationModal from "../Components/Common/ConfirmationModal";
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  User, 
  Mail, 
  Calendar,
  LogOut,
  Check,
  BarChart2,
  Settings,
  Palette,
  Trophy,
  Award,
  Flame,
  Zap,
  Share2
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { setUserInfo, clearUserInfo } from "../Store/Reducers/UserSlice";
import { getToken, clearAuth } from "../utils/auth";
import { clearOfflineData } from "../utils/syncManager";
import ActivityTracker from "../Components/ActivityTracker";
import BackgroundPicker from "../Components/BackgroundPicker";
import BackgroundLayer from "../Components/BackgroundLayer";
import GamificationBar from "../Components/GamificationBar";
import ShareCardModal from "../Components/ShareCard";
import { CustomBadgeSvg } from "../Components/CustomBadgeSvg";
import {
  computeXPBreakdown,
  getTierGradient,
  STREAK_MILESTONES,
} from "../utils/gamificationUtils";

function ProfilePage() {
  const userInfo = useSelector((state) => state.UserSlice);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "activity";
  const xpInfo = computeXPBreakdown(userInfo.xp || 0);
  const tierStyle = getTierGradient(xpInfo.levelTier);

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Edit Profile Details States
  const [profileDetails, setProfileDetails] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
  });

  const [profileErrors, setProfileErrors] = useState({
    name: "",
    email: "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password States
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteOtpSent, setDeleteOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Gamification States
  const [gamificationData, setGamificationData] = useState(null);
  const [loadingGamification, setLoadingGamification] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState("rank");

  useEffect(() => {
    if (activeTab === "gamification" && userInfo.userId) {
      const fetchGamification = async () => {
        setLoadingGamification(true);
        try {
          const token = getToken();
          const res = await axios.get(`${apiUrl}user/gamification`, {
            headers: {
              "X-Authorization": `Bearer ${token}`,
            },
          });
          if (res.data?.status) {
            setGamificationData(res.data.data);
          }
        } catch (err) {
          console.error("Error fetching gamification data:", err);
        } finally {
          setLoadingGamification(false);
        }
      };
      fetchGamification();
    }
  }, [activeTab, userInfo.userId, apiUrl]);

  useEffect(() => {
    setProfileDetails({
      name: userInfo?.name || "",
      email: userInfo?.email || "",
    });
  }, [userInfo]);

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileDetails({ ...profileDetails, [name]: value });
    if (profileErrors[name]) {
      setProfileErrors({ ...profileErrors, [name]: "" });
    }
  };

  const handleProfileBlur = (e) => {
    const { name, value } = e.target;
    validateProfileField(name, value);
  };

  const validateProfileField = (name, value) => {
    let errorMsg = "";
    if (!value.trim()) {
      errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else {
      if (name === "name") {
        if (/[^a-zA-Z\s]/.test(value)) {
          errorMsg = "Name can only contain letters";
        } else if (value.length < 3 || value.length > 20) {
          errorMsg = "Name must be between 3 and 20 characters";
        }
      }
    }
    setProfileErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateProfileAll = () => {
    return validateProfileField("name", profileDetails.name);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!validateProfileAll()) return;

    setIsUpdatingProfile(true);
    const token = getToken();
    try {
      const res = await axios.post(
        `${apiUrl}user/updateprofile`,
        {
          name: profileDetails.name,
          email: profileDetails.email,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.status === true) {
        toast.success(res.data.message || "Profile updated successfully!");
        const { _id, name, username, email, date } = res.data.userData;
        dispatch(setUserInfo({ _id, name, username, email, date }));
      } else {
        toast.error(res.data.message || "Failed to update profile details.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error(err.response?.data?.message || "An error occurred while updating profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDiscardProfile = () => {
    setProfileDetails({
      name: userInfo?.name || "",
      email: userInfo?.email || "",
    });
    setProfileErrors({
      name: "",
      email: "",
    });
    toast.info("Changes discarded");
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";

    if (!value) {
      errorMsg = `${
        name === "currentPassword" 
          ? "Current password" 
          : name === "newPassword" 
          ? "New password" 
          : "Confirm password"
      } is required`;
    } else {
      if (name === "newPassword") {
        if (value.length < 8 || value.length > 20) {
          errorMsg = "Password must be 8 to 20 characters long";
        } else if (!/[a-z]/.test(value)) {
          errorMsg = "Must contain at least one lowercase letter";
        } else if (!/[A-Z]/.test(value)) {
          errorMsg = "Must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(value)) {
          errorMsg = "Must contain at least one number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errorMsg = "Must contain at least one special character";
        }
      }
      if (name === "confirmPassword") {
        if (value !== passwords.newPassword) {
          errorMsg = "Passwords do not match";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateAll = () => {
    const isCurrentValid = validateField("currentPassword", passwords.currentPassword);
    const isNewValid = validateField("newPassword", passwords.newPassword);
    const isConfirmValid = validateField("confirmPassword", passwords.confirmPassword);
    return isCurrentValid && isNewValid && isConfirmValid;
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    const token = getToken();
    try {
      const res = await axios.post(
        `${apiUrl}user/changepassword`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.status === false) {
        toast.error(res.data.message || "Failed to change password.");
      } else {
        toast.success("Password changed successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || "An error occurred while updating your password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardPassword = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.info("Changes discarded");
  };

  const handleRequestDeleteOtp = async (e) => {
    if (e) e.preventDefault();
    setDeleteError("");
    setIsSendingOtp(true);
    const token = getToken();
    try {
      const res = await axios.post(
        `${apiUrl}user/requestdeleteotp`,
        {},
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.status === true) {
        toast.success(res.data.message || "Verification code sent to your email.");
        setDeleteOtpSent(true);
      } else {
        setDeleteError(res.data.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Request delete OTP error:", err);
      setDeleteError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError("");
    if (!deleteOtp) {
      setDeleteError("Verification code is required.");
      return;
    }

    setIsDeleting(true);
    const token = getToken();
    try {
      const res = await axios.post(
        `${apiUrl}user/deleteaccount`,
        {
          otp: deleteOtp,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.status === true) {
        toast.success(res.data.message || "Account deleted successfully.");
        setShowDeleteModal(false);
        setDeleteOtp("");
        setDeleteOtpSent(false);
        try {
          await clearOfflineData();
        } catch (dbErr) {
          console.error("Failed to clear offline databases:", dbErr);
        }
        clearAuth();
        dispatch(clearUserInfo());
        navigate("/login");
      } else {
        setDeleteError(res.data.message || "Incorrect verification code.");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await clearOfflineData();
    } catch (dbErr) {
      console.error("Failed to clear offline databases:", dbErr);
    }
    clearAuth();
    dispatch(clearUserInfo());
    navigate("/login");
    toast.info("You have been logged out");
  };

  const isProfileDirty = useMemo(() => {
    return (
      profileDetails.name !== (userInfo?.name || "")
    );
  }, [profileDetails.name, userInfo]);

  const isPasswordDirty = useMemo(() => {
    return (
      passwords.currentPassword !== "" ||
      passwords.newPassword !== "" ||
      passwords.confirmPassword !== ""
    );
  }, [passwords]);

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col overflow-x-hidden font-sans">
      <BackgroundLayer />

      <Header setShow={() => {}} />

      {/* Main Container */}
      <div id="profile-page-main-container" className="relative z-10 pt-4 px-4 max-w-7xl mx-auto pb-8 w-full flex flex-col gap-5 text-left">
        
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between"
        >
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-all font-semibold focus:outline-none hover:-translate-x-1 duration-200"
          >
            <ArrowLeft size={18} />
            Back to Tasks
          </Link>
        </motion.div>

        {/* 2-Panel Layout Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch w-full"
        >
          
          {/* Left Panel: Profile Summary Card */}
          <div className="md:col-span-1 bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between md:min-h-[460px] min-h-0">
            <div className="w-full flex flex-col items-center">
              {/* Circular Avatar with Level Tier Ring */}
              <div className="relative mb-6 mt-4">
                <motion.div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-black shadow-lg relative z-10 bg-gradient-to-br ${tierStyle.gradient}`}
                  style={{ boxShadow: `0 0 24px ${tierStyle.glow}` }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  {userInfo?.name ? userInfo.name[0].toUpperCase() : "?"}
                  
                  {/* Floating Level Badge Pill */}
                  <div
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-[10px] font-black tracking-wider text-zinc-300 shadow-xl flex items-center gap-1`}
                    style={{ borderColor: tierStyle.glow.replace("0.5", "0.3") }}
                  >
                    <span>Lv</span>
                    <span className={`bg-gradient-to-r ${tierStyle.gradient} bg-clip-text text-transparent`}>{xpInfo.level}</span>
                  </div>
                </motion.div>
              </div>

              {/* Name & Username Subtitle */}
              <h1 className="text-xl font-extrabold text-zinc-200 tracking-tight mt-2 text-center">
                {userInfo?.name || "User"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1 text-center font-medium">
                @{userInfo?.username || "username"}
              </p>

              {/* Vertical Menu Tabs */}
              <div className="w-full mt-5 md:mt-8 flex flex-col gap-1.5">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "personal"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <User size={15} />
                  <span>Personal Information</span>
                </button>

                <button
                  onClick={() => setActiveTab("activity")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "activity"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <BarChart2 size={15} />
                  <span>Activity Tracker</span>
                </button>

                <button
                  onClick={() => setActiveTab("gamification")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "gamification"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <Trophy size={15} />
                  <span>Progress & Badges</span>
                </button>

                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "appearance"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </button>

                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "password"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <Lock size={15} />
                  <span>Login & Password</span>
                </button>

                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    activeTab === "account"
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-350 shadow-lg shadow-purple-950/15"
                      : "bg-transparent border border-transparent text-zinc-405 hover:bg-zinc-900/30 hover:text-zinc-200"
                  }`}
                >
                  <Settings size={15} />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer bg-transparent border border-transparent text-zinc-405 hover:bg-red-950/15 hover:text-red-400"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Form Card matching active tab */}
          <div className={`md:col-span-2 bg-zinc-950/40 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between md:min-h-[460px] min-h-0 ${
            (activeTab === "activity" || activeTab === "gamification") ? "overflow-y-auto" : ""
          }`}>
            
            {activeTab === "personal" ? (
              /* TAB 1: Personal Information */
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="border-b border-zinc-900/60 pb-4">
                    <h2 className="text-lg font-bold text-zinc-100">Personal Information</h2>
                    <p className="text-[10px] text-zinc-500 mt-1">Configure your personal profile display details.</p>
                  </div>

                  {/* Forms Grid */}
                  <form className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {/* Full Name */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                          <User size={14} />
                        </span>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={profileDetails.name}
                          onChange={handleProfileInput}
                          onBlur={handleProfileBlur}
                          disabled={isUpdatingProfile}
                          placeholder="Enter your full name"
                          className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-9 pr-3 py-2.5 text-zinc-150 text-xs outline-none transition-all duration-150 disabled:opacity-50"
                        />
                      </div>
                      {profileErrors.name && (
                        <p className="text-[10px] text-red-400 font-medium transition-all duration-150">{profileErrors.name}</p>
                      )}
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                          <User size={14} />
                        </span>
                        <input
                          type="text"
                          value={userInfo?.username || ""}
                          disabled
                          className="w-full bg-zinc-900/10 border border-zinc-900/85 rounded-xl pl-9 pr-3 py-2.5 text-zinc-500 text-xs outline-none cursor-not-allowed select-none"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600">
                          <Mail size={14} />
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={userInfo?.email || ""}
                          disabled
                          className="w-full bg-zinc-900/10 border border-zinc-900/85 rounded-xl pl-9 pr-20 py-2.5 text-zinc-500 text-xs outline-none cursor-not-allowed select-none"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 text-emerald-500 text-[10px] font-semibold select-none">
                          <Check size={12} className="stroke-[3]" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Account Created
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                          <Calendar size={14} />
                        </span>
                        <input
                          type="text"
                          value={userInfo?.dateOfAccountCreation ? new Date(userInfo.dateOfAccountCreation).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          }) : "N/A"}
                          disabled
                          className="w-full bg-zinc-900/10 border border-zinc-900/85 rounded-xl pl-9 pr-3 py-2.5 text-zinc-500 text-xs outline-none cursor-not-allowed select-none"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Actions */}
                {isProfileDirty && (
                  <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-zinc-900/60 w-full animate-fade-in">
                    <button
                      onClick={handleDiscardProfile}
                      disabled={isUpdatingProfile}
                      className="py-2.5 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === "activity" ? (
              /* TAB 2: Activity Tracker */
              <ActivityTracker />
            ) : activeTab === "gamification" ? (
              /* TAB 6: Progress & Badges (Gamification) */
              <div className="flex flex-col h-full space-y-6">
                {/* Header Title */}
                <div className="border-b border-zinc-900/60 pb-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-zinc-100">Progress & Badges</h2>
                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">View your leveling milestones, streak records, and showcase your achievements.</p>
                  </div>
                  {gamificationData && (
                    <button
                      onClick={() => {
                        setShareType("rank");
                        setShowShareModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-purple-950/20 flex items-center gap-1.5"
                    >
                      <Share2 size={12} />
                      <span>Share Card</span>
                    </button>
                  )}
                </div>

                {loadingGamification ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <span className="text-xs text-zinc-500 font-bold">Unlocking achievements...</span>
                  </div>
                ) : !gamificationData ? (
                  <div className="text-center py-12">
                    <span className="text-xs text-zinc-500">Failed to load gamification data. Please try again.</span>
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    {/* Top Level Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Level Badge Card */}
                      {(() => {
                        const xpInfo = computeXPBreakdown(gamificationData.xp);
                        const tierStyle = getTierGradient(xpInfo.levelTier);
                        return (
                          <div
                            className="relative overflow-hidden rounded-2xl p-4 bg-zinc-900/40 border border-zinc-800/80 flex flex-col items-center text-center justify-center gap-2"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                              style={{ background: `radial-gradient(circle, ${tierStyle.glow.replace("0.5","0.08")} 0%, transparent 70%)` }} />
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center font-black text-xl text-black shadow-lg`}
                              style={{ boxShadow: `0 0 16px ${tierStyle.glow}` }}
                            >
                              {xpInfo.level}
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-zinc-200">{xpInfo.levelTitle}</div>
                              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{xpInfo.levelTier} tier</div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Streak Card */}
                      <div className="rounded-2xl p-4 bg-zinc-900/40 border border-zinc-800/80 flex flex-col items-center text-center justify-center gap-1.5 relative">
                        <Flame className="w-9 h-9 text-amber-500 fill-amber-500/25 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]" />
                        <div>
                          <div className="text-base font-black text-zinc-150">{gamificationData.currentStreak} Days</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Current Streak</div>
                        </div>
                        <div className="text-[9px] text-zinc-600 font-semibold mt-0.5">
                          Longest: {gamificationData.longestStreak} days
                        </div>
                      </div>

                      {/* Overview Stats */}
                      <div className="rounded-2xl p-4 bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-center gap-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-500">Global Rank</span>
                          <span className="font-extrabold text-amber-400 font-mono">#{gamificationData.rank}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-500">Tasks Completed</span>
                          <span className="font-extrabold text-purple-400 font-mono">{gamificationData.totalCompleted}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-500">Badges Earned</span>
                          <span className="font-extrabold text-violet-400 font-mono">{gamificationData.badgesEarned} / {STREAK_MILESTONES.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (Full) */}
                    <div className="rounded-2xl p-5 bg-zinc-900/30 border border-zinc-850/50">
                      <GamificationBar xp={gamificationData.xp} streak={gamificationData.currentStreak} size="lg" showStreak={false} />
                    </div>

                    {/* Badges Earned Section */}
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                        <Award size={14} className="text-purple-400" />
                        <span>Streak Badges ({gamificationData.badgesEarned} Unlocked)</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {STREAK_MILESTONES.map((badge) => {
                          const isUnlocked = gamificationData.longestStreak >= badge.days;
                          return (
                            <div
                              key={badge.days}
                              className={`rounded-2xl p-3 border flex flex-col items-center text-center justify-center gap-2 transition-all ${
                                isUnlocked
                                  ? "bg-zinc-900/40 border-zinc-850 shadow-md"
                                  : "bg-zinc-950/20 border-zinc-900/50 opacity-40"
                              }`}
                            >
                              <CustomBadgeSvg days={badge.days} size={64} isUnlocked={isUnlocked} />
                              <div className="min-h-[28px] flex flex-col items-center justify-center">
                                <span className="text-[9px] font-black text-zinc-300 leading-tight">{badge.badge}</span>
                                <span className="text-[8px] font-bold text-zinc-600 mt-0.5">{badge.days} Day Streak</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Share Cards Panel */}
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                        <Share2 size={14} className="text-violet-400" />
                        <span>Generate Share Cards</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { type: "rank", label: "Rank Card", desc: "Show off your community standing", color: "from-amber-500/10 to-amber-600/5 hover:border-amber-500/35 border-zinc-900", icon: Trophy, iconColor: "text-amber-400" },
                          { type: "streak", label: "Streak Card", desc: "Celebrate your consecutive days", color: "from-orange-500/10 to-amber-600/5 hover:border-orange-500/35 border-zinc-900", icon: Flame, iconColor: "text-orange-400" },
                          { type: "achievement", label: "Level Card", desc: "Share your level milestone", color: "from-violet-500/10 to-indigo-600/5 hover:border-violet-500/35 border-zinc-900", icon: Zap, iconColor: "text-violet-400" }
                        ].map((btn) => {
                          const BtnIcon = btn.icon;
                          return (
                            <button
                              key={btn.type}
                              onClick={() => {
                                setShareType(btn.type);
                                setShowShareModal(true);
                              }}
                              className={`rounded-2xl p-4 bg-gradient-to-br ${btn.color} border text-left flex flex-col gap-2 transition-all cursor-pointer group`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className={`w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-all`}>
                                  <BtnIcon size={14} className={btn.iconColor} />
                                </div>
                                <Share2 size={12} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                              </div>
                              <div>
                                <h4 className="text-xs font-extrabold text-zinc-200">{btn.label}</h4>
                                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{btn.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ) : activeTab === "password" ? (
              /* TAB 3: Login & Password */
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="border-b border-zinc-900/60 pb-4">
                    <h2 className="text-lg font-bold text-zinc-100">Login & Password</h2>
                    <p className="text-[10px] text-zinc-500 mt-1">Manage your account login credentials securely.</p>
                  </div>

                  {/* Forms Inputs */}
                  <form className="space-y-4 pt-2">
                    {/* Current Password */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="currentPassword" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Current Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                          <Lock size={14} />
                        </span>
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwords.currentPassword}
                          onChange={handleInput}
                          onBlur={handleBlur}
                          disabled={isLoading}
                          placeholder="Enter current password"
                          className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-9 pr-10 py-2.5 text-zinc-150 text-xs outline-none transition-all duration-150 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          {showCurrentPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-[10px] text-red-400 font-medium transition-all duration-150">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* New Password */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="newPassword" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          New Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                            <Lock size={14} />
                          </span>
                          <input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleInput}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            placeholder="Min. 8 characters"
                            className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-9 pr-10 py-2.5 text-zinc-150 text-xs outline-none transition-all duration-150 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            {showNewPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-[10px] text-red-400 font-medium transition-all duration-150">{errors.newPassword}</p>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                            <Lock size={14} />
                          </span>
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleInput}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            placeholder="Repeat new password"
                            className="w-full bg-zinc-900/40 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-9 pr-10 py-2.5 text-zinc-150 text-xs outline-none transition-all duration-150 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-[10px] text-red-455 font-medium transition-all duration-150">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Actions */}
                {isPasswordDirty && (
                  <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-zinc-900/60 w-full animate-fade-in">
                    <button
                      onClick={handleDiscardPassword}
                      disabled={isLoading}
                      className="py-2.5 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.99] duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === "appearance" ? (
              /* TAB 5: Appearance */
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="border-b border-zinc-900/60 pb-4 text-left">
                    <h2 className="text-lg font-bold text-zinc-100">Appearance</h2>
                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">Personalize your background image and adjust color overlays.</p>
                  </div>
                  <BackgroundPicker />
                </div>
              </div>
            ) : (
              /* TAB 4: Account Settings */
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  {/* Header Title */}
                  <div className="border-b border-zinc-900/60 pb-4 text-left">
                    <h2 className="text-lg font-bold text-zinc-100">Account Settings</h2>
                    <p className="text-[10px] text-zinc-500 mt-1 font-medium">Configure sync settings and manage your account credentials.</p>
                  </div>

                  {/* Future Placeholders */}
                  <div className="space-y-4 pt-2 text-left">
                    <div className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-900/60 rounded-2xl">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-300">Cloud Sync Frequency</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">Select sync intervals for real-time backup.</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg select-none">
                        Realtime Sync
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-900/60 rounded-2xl opacity-60 select-none">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-300">Data Portability (Coming Soon)</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Export your complete task lists and logs in CSV/JSON format.</p>
                      </div>
                      <button disabled className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg cursor-not-allowed">
                        Export Data
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-red-950/45 pt-6 mt-8 text-left">
                    <h3 className="text-sm font-bold text-red-500/90 tracking-wide uppercase">Danger Zone</h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      Permanently delete your account, your tasks, and all activity logs. This action is irreversible.
                    </p>
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-4 py-2.5 px-5 border border-red-900/50 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer focus:outline-none"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </motion.div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-red-500 mb-2 text-left">Delete Your Account</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 text-left">
                Are you absolutely sure? This will permanently delete your account, all your tasks, and activity records. This action cannot be undone.
              </p>

              {!deleteOtpSent ? (
                <div className="space-y-6 text-left">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    To proceed, we must verify your request. A 6-digit verification code will be sent to your registered email: <strong className="text-zinc-200">{userInfo?.email}</strong>.
                  </p>
                  {deleteError && (
                    <p className="text-[10px] text-red-400 font-medium">{deleteError}</p>
                  )}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteError("");
                      }}
                      disabled={isSendingOtp}
                      className="py-2.5 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestDeleteOtp}
                      disabled={isSendingOtp}
                      className="py-2.5 px-5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                    >
                      {isSendingOtp ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending Code...
                        </>
                      ) : (
                        "Send Verification Code"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="deleteOtp" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Enter Verification Code
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                        <Lock size={14} />
                      </span>
                      <input
                        id="deleteOtp"
                        type="text"
                        required
                        maxLength={6}
                        value={deleteOtp}
                        onChange={(e) => {
                          setDeleteOtp(e.target.value);
                          setDeleteError("");
                        }}
                        placeholder="Enter 6-digit code"
                        className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-9 pr-3 py-2.5 text-zinc-200 text-xs outline-none transition-all duration-150"
                      />
                    </div>
                    {deleteError && (
                      <p className="text-[10px] text-red-400 font-medium">{deleteError}</p>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-2">
                      Code sent to your email. Didn't receive it?{" "}
                      <button
                        type="button"
                        onClick={handleRequestDeleteOtp}
                        disabled={isSendingOtp}
                        className="text-purple-400 hover:text-purple-300 font-bold underline focus:outline-none disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteOtp("");
                        setDeleteOtpSent(false);
                        setDeleteError("");
                      }}
                      disabled={isDeleting}
                      className="py-2.5 px-5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDeleting || !deleteOtp}
                      className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete Irreversibly"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        type="warning"
      />

      {showShareModal && (
        <ShareCardModal
          type={shareType}
          data={{
            name: userInfo.name,
            username: userInfo.username,
            rank: gamificationData?.rank || 1,
            level: gamificationData?.level || userInfo.level || 1,
            xp: gamificationData?.xp || userInfo.xp || 0,
            currentStreak: gamificationData?.currentStreak || userInfo.currentStreak || 0,
            longestStreak: gamificationData?.longestStreak || 0,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
      </div>
    </div>
  );
}

export default ProfilePage;
