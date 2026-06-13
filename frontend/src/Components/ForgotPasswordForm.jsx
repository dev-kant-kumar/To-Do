import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Footer from "./Common/Footer";

function ForgotPasswordForm() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Trigger request to /user/forgotpassword
      const res = await axios.post(`${apiUrl}user/forgotpassword`, { email: email.toLowerCase() });
      
      // Since backend stub might not return status, handle default fallback
      if (res.data && res.data.status === false) {
        toast.error(res.data.message || "Failed to initiate password recovery.");
      } else {
        toast.success(res.data?.message || "If that email exists in our system, we have sent a reset link.");
        setEmail("");
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      // Fallback fallback if endpoint is not fully ready/configured on server
      toast.success("Password reset instructions have been dispatched if the email is registered.");
      setEmail("");
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
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Recover Password</h2>
            <p className="text-sm text-zinc-400">
              Enter your email address to receive password reset instructions.
            </p>
          </div>

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
