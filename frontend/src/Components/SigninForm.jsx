import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../Store/Reducers/UserSlice";
import { setToken } from "../utils/auth";
import { toast } from "react-toastify";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../Components/Common/Footer";

function SigninForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [inputValue, setInputValue] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [formError, setFormError] = useState("");

  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleFormInput = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      setErrors((prev) => ({ 
        ...prev, 
        [name]: name === "username" ? "Username or Email is required" : `${name.charAt(0).toUpperCase() + name.slice(1)} is required` 
      }));
    }
  };

  const validate = () => {
    let tempErrors = { username: "", password: "" };
    let isValid = true;

    if (!inputValue.username.trim()) {
      tempErrors.username = "Username or Email is required";
      isValid = false;
    }
    if (!inputValue.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const formValidation = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) {
      setFormError("Please fill all the required fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(apiUrl + "user/signin", {
        username: inputValue.username,
        password: inputValue.password,
      });

      const { status, message, isUnverified, email } = res.data;

      if (status === true) {
        const { token, userData } = res.data;
        const { _id, name, username, email: userEmail, date } = userData;

        dispatch(setUserInfo({ _id, name, username, email: userEmail, date }));
        setToken(token, keepSignedIn);
        navigate("/home");
      } else if (isUnverified) {
        setUnverifiedEmail(email);
        setShowOtpVerify(true);
        setFormError("");
      } else {
        setFormError(message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setFormError(err.response?.data?.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setFormError("");
    if (otpValue.length !== 6) {
      setFormError("Verification code must be 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(apiUrl + "user/verifyotp", {
        email: unverifiedEmail,
        otp: otpValue,
      });

      const { status, message } = res.data;
      if (status === true) {
        toast.success("Account verified successfully! Please log in.");
        setShowOtpVerify(false);
        setOtpValue("");
        setFormError("");
        setInputValue((prev) => ({ ...prev, password: "" }));
      } else {
        setFormError(message || "Incorrect verification code.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setFormError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFormError("");
    setIsLoading(true);
    try {
      const res = await axios.post(apiUrl + "user/resendotp", {
        email: unverifiedEmail,
      });
      const { status, message } = res.data;
      if (status === true) {
        toast.success("Verification code resent successfully!");
        setFormError("");
      } else {
        setFormError(message || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setFormError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col justify-between overflow-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      {/* Header Logo */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 h-20 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
            ✓
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-purple-400 transition-colors duration-200">
            todo<span className="text-purple-500">.</span>
          </span>
        </Link>
      </header>

      {/* Form Section */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {showOtpVerify ? "Verify Email" : "Log In"}
            </h2>
            <p className="text-sm text-zinc-400">
              {showOtpVerify 
                ? "Enter the 6-digit verification code sent to your email."
                : "Welcome back! Access your tasks and schedule."
              }
            </p>
          </div>

          {showOtpVerify ? (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-1.5">
                <label htmlFor="otp" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="otp"
                    type="text"
                    name="otp"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    disabled={isLoading}
                    placeholder="••••••"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-3 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center tracking-[0.3em] font-mono font-semibold"
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl text-center animate-pulse">
                  {formError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otpValue.length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Activate
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Extra controls */}
              <div className="flex items-center justify-between text-xs font-semibold mt-6 px-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpVerify(false);
                    setFormError("");
                  }}
                  disabled={isLoading}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={formValidation} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <User size={16} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={inputValue.username}
                    onChange={handleFormInput}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Enter your username or email"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-3 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-400 font-medium animate-pulse">{errors.username}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={inputValue.password}
                    onChange={handleFormInput}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-12 py-3 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium animate-pulse">{errors.password}</p>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  id="keep-signed-in"
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0 focus:ring-1 outline-none transition-colors accent-purple-600"
                />
                <label htmlFor="keep-signed-in" className="ml-2.5 text-sm font-medium text-zinc-400 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl text-center">
                  {formError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <Footer minimal />
    </div>
  );
}

export default SigninForm;
