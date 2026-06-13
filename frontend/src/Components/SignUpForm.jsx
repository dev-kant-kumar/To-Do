import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Footer from "../Components/Common/Footer";

function SignUpForm() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Initialize from sessionStorage draft if available
  const getInitialValue = () => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("signup_draft") || "{}");
      return {
        username: draft.username || "",
        email: draft.email || "",
        password: draft.password || "",
      };
    } catch {
      return { username: "", email: "", password: "" };
    }
  };

  const getInitialTerms = () => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("signup_draft") || "{}");
      return draft.agreedToTerms || false;
    } catch {
      return false;
    }
  };

  const [inputValue, setInputValue] = useState(getInitialValue);
  const [agreedToTerms, setAgreedToTerms] = useState(getInitialTerms);

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      "signup_draft",
      JSON.stringify({ ...inputValue, agreedToTerms })
    );
  }, [inputValue, agreedToTerms]);

  const handleFormInput = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleTermsChange = (e) => {
    setAgreedToTerms(e.target.checked);
  };

  const generatePassword = () => {
    const length = 16;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,./<>?";
    const allChars = lowercase + uppercase + numbers + symbols;

    let generated = "";
    // Ensure at least one character from each set is included
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < length; i++) {
      generated += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the characters
    generated = generated
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setInputValue((prev) => ({ ...prev, password: generated }));
    // Clear password error if present
    setErrors((prev) => ({ ...prev, password: "" }));
    // Force show password so they can see/copy it
    setShowPassword(true);

    // Copy to clipboard
    navigator.clipboard.writeText(generated)
      .then(() => {
        toast.success("Strong password generated and copied to clipboard!");
      })
      .catch(() => {
        toast.success("Strong password generated!");
      });
  };

  const calculateStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    return score;
  };

  const strengthScore = calculateStrength(inputValue.password);

  const getStrengthLabel = (score) => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Medium";
    if (score === 4) return "Strong";
    return "Excellent";
  };

  const getStrengthColor = (score) => {
    if (score <= 2) return "text-red-400";
    if (score <= 3) return "text-amber-400";
    if (score === 4) return "text-emerald-400";
    return "text-purple-400";
  };

  const getBarColor = (score) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-amber-500";
    if (score === 4) return "bg-emerald-500";
    return "bg-purple-500";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";

    if (!value.trim()) {
      errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else {
      if (name === "username") {
        if (/[^a-zA-Z0-9]/.test(value)) {
          errorMsg = "Username can only contain letters and numbers";
        } else if (!isNaN(value[0])) {
          errorMsg = "Username cannot start with a number";
        } else if (value.length < 3 || value.length > 15) {
          errorMsg = "Username must be between 3 and 15 characters";
        }
      }
      if (name === "email") {
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailRegex.test(value.toLowerCase())) {
          errorMsg = "Invalid email format";
        }
      }
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
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const validateAll = () => {
    let isValid = true;
    Object.keys(inputValue).forEach((field) => {
      const fieldValid = validateField(field, inputValue[field]);
      if (!fieldValid) isValid = false;
    });
    return isValid;
  };

  const formValidation = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fill all the required fields");
      return;
    }
    if (!agreedToTerms) {
      toast.error("You must agree to the Terms & Conditions");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(apiUrl + "user/signup", {
        name: inputValue.username, // satisfies required name in backend schema
        username: inputValue.username,
        email: inputValue.email.toLowerCase(),
        password: inputValue.password,
      });

      if (res.data.status === true) {
        toast.success(res.data.message || "Registration successful!");
        toast("Welcome onboard! Please log in to manage your tasks.");
        sessionStorage.removeItem("signup_draft");
        navigate("/login");
      } else {
        toast.info(res.data.message || "Failed to sign up.");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      toast.error(err.response?.data?.message || "Error occurred during signup!");
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
        <div className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Sign Up</h2>
            <p className="text-sm text-zinc-400">
              Create your account to start managing tasks.
            </p>
          </div>

          <form onSubmit={formValidation} className="space-y-5">

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Username
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
                  placeholder="Choose a username"
                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-400 font-medium animate-pulse">{errors.username}</p>
              )}
            </div>

            {/* Email Address */}
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
                  name="email"
                  value={inputValue.email}
                  onChange={handleFormInput}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-medium animate-pulse">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 focus:outline-none"
                >
                  <Sparkles size={12} />
                  Generate Strong Password
                </button>
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
                  placeholder="Min. 8 characters"
                  className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-12 py-2.5 text-zinc-100 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Password Strength Indicator */}
              {inputValue.password && (
                <div className="mt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Password strength:</span>
                    <span className={`font-semibold ${getStrengthColor(strengthScore)}`}>
                      {getStrengthLabel(strengthScore)}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 h-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-full rounded-full transition-all duration-300 ${
                          index <= strengthScore ? getBarColor(strengthScore) : "bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-400 font-medium animate-pulse">{errors.password}</p>
              )}
            </div>


            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={handleTermsChange}
                disabled={isLoading}
                className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0 focus:ring-1 outline-none transition-colors accent-purple-600 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 text-sm text-zinc-400 cursor-pointer select-none">
                Agree with{" "}
                <Link to="/legal/terms-and-conditions" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing Up...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all">
              Login Here
            </Link>
          </div>
        </div>
      </div>

      <Footer minimal />
    </div>
  );
}

export default SignUpForm;
