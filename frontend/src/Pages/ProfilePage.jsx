import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../Components/Header";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  BarChart2
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { setUserInfo, clearUserInfo } from "../Store/Reducers/UserSlice";
import ActivityTracker from "../Components/ActivityTracker";

function ProfilePage() {
  const userInfo = useSelector((state) => state.UserSlice);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "activity";

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
    const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
      toast.success("Your password has been updated successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      dispatch(clearUserInfo());
      navigate("/login");
      toast.info("You have been logged out");
    }
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
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

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
              {/* Circular Avatar */}
              <div className="relative mb-4 mt-4">
                <div className="w-24 h-24 bg-zinc-950 border-2 border-purple-500/20 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-lg relative z-10 bg-gradient-to-tr from-zinc-900 to-zinc-850 ring-4 ring-purple-500/5">
                  {userInfo?.name ? userInfo.name[0].toUpperCase() : "?"}
                </div>
              </div>

              {/* Name & Username Subtitle */}
              <h1 className="text-xl font-extrabold text-zinc-155 tracking-tight mt-2 text-center">
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
            activeTab === "activity" ? "overflow-y-auto" : ""
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
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-650">
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
                      className="py-2.5 px-5 rounded-xl border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
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
            ) : (
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
                          <p className="text-[10px] text-red-450 font-medium transition-all duration-150">{errors.confirmPassword}</p>
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
                      className="py-2.5 px-5 rounded-xl border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30 transition-all font-semibold text-xs cursor-pointer focus:outline-none"
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
            )}

          </div>

        </motion.div>

      </div>
    </div>
  );
}

export default ProfilePage;
