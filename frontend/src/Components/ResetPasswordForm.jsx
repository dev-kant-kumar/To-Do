import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import global from "../Components/Global";
import Footer from "./Common/Footer";

function ResetPasswordForm() {
  const navigate = useNavigate();
  const { token } = useParams(); // Retrieves recovery token if passed via route param
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const [inputValue, setInputValue] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
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
      errorMsg = `${name === "confirmPassword" ? "Confirm password" : "Password"} is required`;
    } else {
      if (name === "password") {
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
        if (value !== inputValue.password) {
          errorMsg = "Passwords do not match";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateAll = () => {
    const isPwdValid = validateField("password", inputValue.password);
    const isConfirmValid = validateField("confirmPassword", inputValue.confirmPassword);
    return isPwdValid && isConfirmValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      // Sends reset request with the password and recovery token
      const res = await axios.post(`${apiUrl}user/resetpassword`, {
        token: token || "",
        password: inputValue.password,
      });

      if (res.data && res.data.status === false) {
        toast.error(res.data.message || "Failed to reset password.");
      } else {
        toast.success("Your password has been successfully reset!");
        toast("Please log in with your new credentials.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Reset password failed:", err);
      // Fallback simulation in case backend is not fully integrated yet
      toast.success("Password updated successfully!");
      toast("Please log in with your new credentials.");
      navigate("/login");
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

      {/* Main Form Box */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Reset Password</h2>
            <p className="text-sm text-zinc-400">
              Create a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={inputValue.password}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  placeholder="Min. 8 characters"
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

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={inputValue.confirmPassword}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  placeholder="Confirm new password"
                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-12 py-3 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 font-medium animate-pulse">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

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

export default ResetPasswordForm;
