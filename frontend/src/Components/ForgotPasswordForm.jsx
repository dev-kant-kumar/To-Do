import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import Footer from "./Common/Footer";

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpReset, setShowOtpReset] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpErrors, setOtpErrors] = useState({ otp: "", password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");

  const handleInput = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const handleBlur = () => {
    if (!email.trim()) {
      setError("Email address is required");
    } else {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
      if (!emailRegex.test(email.toLowerCase())) {
        setError("Invalid email format");
      }
    }
  };

  const validate = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (!emailRegex.test(email.toLowerCase())) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(`${apiUrl}user/forgotpassword`, { email: email.toLowerCase() });
      
      if (res.data && res.data.status === false) {
        setFormError(res.data.message || "Failed to initiate password recovery.");
      } else {
        toast.success(res.data?.message || "Verification code sent to your email!");
        setShowOtpReset(true);
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setFormError(err.response?.data?.message || "Failed to initiate password recovery.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    let isValid = true;
    let tempErrors = { otp: "", password: "", confirmPassword: "" };

    if (otp.length !== 6) {
      tempErrors.otp = "Verification code must be 6 digits";
      isValid = false;
    }
    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8 || password.length > 20) {
      tempErrors.password = "Password must be 8 to 20 characters";
      isValid = false;
    }
    if (confirmPassword !== password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setOtpErrors(tempErrors);
    if (!isValid) return;

    setIsLoading(true);
    try {
      const res = await axios.post(`${apiUrl}user/resetpassword`, {
        email: email.toLowerCase(),
        otp,
        password,
      });

      if (res.data && res.data.status === false) {
        setFormError(res.data.message || "Failed to reset password.");
      } else {
        toast.success("Password reset successfully! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Reset password failed:", err);
      setFormError(err.response?.data?.message || "Failed to reset password.");
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

      {/* Main Recovery Form */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {showOtpReset ? "Reset Password" : "Recover Password"}
            </h2>
            <p className="text-sm text-zinc-400">
              {showOtpReset 
                ? `Enter the code sent to ${email} and your new password.`
                : "Enter your email address to receive password reset instructions."}
            </p>
          </div>

          {showOtpReset ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* Verification Code */}
              <div className="space-y-1.5">
                <label htmlFor="reset-otp" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    id="reset-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-center text-zinc-100 text-sm tracking-widest outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold"
                  />
                </div>
                {otpErrors.otp && (
                  <p className="text-xs text-red-400 font-medium animate-pulse">{otpErrors.otp}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter new password"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {otpErrors.password && (
                  <p className="text-xs text-red-400 font-medium animate-pulse">{otpErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Confirm new password"
                    className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {otpErrors.confirmPassword && (
                  <p className="text-xs text-red-400 font-medium animate-pulse">{otpErrors.confirmPassword}</p>
                )}
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl text-center">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center text-xs space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="text-purple-400 hover:text-purple-300 font-semibold focus:outline-none block w-full text-center"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpReset(false)}
                  disabled={isLoading}
                  className="text-zinc-500 hover:text-zinc-400 font-semibold focus:outline-none block w-full text-center"
                >
                  Go Back
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  placeholder="Enter your registered email"
                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-3 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 font-medium animate-pulse">{error}</p>
              )}
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl text-center">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending link...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Log In
            </Link>
          </div>
        </div>
      </div>

      <Footer minimal />
    </div>
  );
}

export default ForgotPasswordForm;
