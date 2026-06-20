import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { setUserInfo, clearUserInfo } from "../Store/Reducers/UserSlice";
import { loadCachedUser } from "../Store/Reducers/UserSlice";
import { setPreLoader } from "../Store/Reducers/Loader";
import { getToken, removeToken } from "../utils/auth";

// Route Guards
import { ProtectedRoute, GuestRoute } from "../Components/ProtectedRoutes";

// Pages
import SignUp from "../Components/SignUpForm";
import SignIn from "../Components/SigninForm";
import Home from "../Pages/Home";
import ProfilePage from "../Pages/ProfilePage";
import PlannerPage from "../Pages/PlannerPage";
import ErrorPage from "../Pages/ErrorPage";
import LandingPage from "./LandingPage/LandingPage";
import ForgotPasswordForm from "../Components/ForgotPasswordForm";
import ResetPasswordForm from "../Components/ResetPasswordForm";
import LoadingPage from "../Pages/LoadingPage";
import SEO from "../Components/SEO";

// Legal Pages
import PrivacyPolicy from "./LegalPages/PrivacyPolicy/PrivacyPolicy";
import CookiePolicy from "./LegalPages/CookiePolicy/CookiePolicy";
import DeleteMyData from "./LegalPages/DeleteMyData/DeleteMyData";
import TermsAndConditions from ".//LegalPages/TermsAndConditions/TermsAndConditions";
import Disclaimer from "./LegalPages/Disclaimer/Disclaimer";
import RefundPolicy from "./LegalPages/RefundPolicy/RefundPolicy";
import Accessibility from "./LegalPages/Accessibility/Accessibility";

// Legal Layout
const LegalLayout = () => <Outlet />;

function AuthenticationPage() {
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { preloader } = useSelector((state) => state.Loader);
  const userInfo = useSelector((state) => state.UserSlice);

  // Fetch user info from token — with full offline resilience
  useEffect(() => {
    const token = getToken();
    if (!token) {
      dispatch(setPreLoader(false));
      return;
    }

    dispatch(setPreLoader(true));

    axios
      .get(`${apiUrl}user/getUserData`, {
        headers: {
          "X-Authorization": `Bearer ${token}`,
        },
        // Short timeout so offline detection is fast
        timeout: 8000,
      })
      .then((res) => {
        if (res.data.status) {
          const { _id, name, username, email, date } = res.data.data;
          dispatch(setUserInfo({ _id, name, username, email, date }));
        } else {
          // Server explicitly rejected the token — treat as logged out
          removeToken();
          dispatch(clearUserInfo());
        }
      })
      .catch((err) => {
        const isNetworkError = !err.response;
        const isAuthError =
          err.response &&
          (err.response.status === 401 || err.response.status === 403);

        if (isNetworkError) {
          // ─── OFFLINE PATH ────────────────────────────────────────────────
          // Network is unavailable — do NOT wipe the token.
          // Instead, load the cached user identity from localStorage and
          // hydrate Redux. The user stays authenticated and can use the app.
          console.warn("[Auth] Network unavailable — loading from cache.");
          const cached = loadCachedUser();
          if (cached && cached._id) {
            dispatch(setUserInfo(cached));
          } else {
            // No cache at all (first-ever load, never been online) — must log in
            removeToken();
            dispatch(clearUserInfo());
          }
        } else if (isAuthError) {
          // ─── AUTH REJECTED ───────────────────────────────────────────────
          // The server says this token is invalid/expired — log the user out.
          console.error("[Auth] Token rejected by server:", err.response.status);
          removeToken();
          dispatch(clearUserInfo());
        } else {
          // ─── OTHER SERVER ERROR (5xx etc.) ───────────────────────────────
          // Server is having trouble but the token may still be valid.
          // Fall back to cache to keep the user in the app.
          console.warn("[Auth] Server error — loading from cache:", err.response?.status);
          const cached = loadCachedUser();
          if (cached && cached._id) {
            dispatch(setUserInfo(cached));
          } else {
            removeToken();
            dispatch(clearUserInfo());
          }
        }
      })
      .finally(() => dispatch(setPreLoader(false)));
  }, [apiUrl, dispatch]);


  // Preloader
  if (preloader) {
    return <LoadingPage />;
  }

  // Routes
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={
            userInfo?.userId ? (
              <Navigate to="/home" replace />
            ) : (
              <><SEO title="todo. | Simple, Clean Task Management" description="Organize your day, track your projects, and boost your daily productivity with todo. — a minimalist, high-fidelity task manager." /><LandingPage /></>
            )
          } />

          {/* Auth (Guest Only) */}
          <Route element={<GuestRoute />}>
            <Route path="/sign-up" element={<><SEO title="Create an Account | todo." description="Join todo. today. Set up your workspace, track your tasks, and achieve your goals with our modern task manager." /><SignUp /></>} />
            <Route path="/login" element={<><SEO title="Sign In | todo." description="Access your personal workspace on todo. to manage tasks, review starred items, and organize your schedules." /><SignIn /></>} />
            <Route path="/forgot-password" element={<><SEO title="Forgot Password | todo." description="Recover your account on todo.. Enter your email address to receive a secure password reset link." /><ForgotPasswordForm /></>} />
            <Route path="/reset-password" element={<><SEO title="Reset Password | todo." description="Create a new secure password for your account on todo. and get back to managing your day." /><ResetPasswordForm /></>} />
            <Route path="/reset-password/:token" element={<><SEO title="Reset Password | todo." description="Create a new secure password for your account on todo. and get back to managing your day." /><ResetPasswordForm /></>} />
          </Route>

          {/* App Pages (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<><SEO title="Dashboard | todo." description="Manage your tasks, filter by Starred, Today, or Deleted, and track your daily lists on todo.." /><Home /></>} />
            <Route path="/profile" element={<><SEO title="Settings | todo." description="Update your personal information, manage security, and configure your todo. profile." /><ProfilePage /></>} />
            <Route path="/planner" element={<><SEO title="Planner | todo." description="Plan your week and month tasks visually on a modern calendar view." /><PlannerPage /></>} />
          </Route>

          {/* Legal Pages - Nested (Public) */}
          <Route path="/legal" element={<LegalLayout />}>
            <Route
              index
              element={<Navigate to="terms-and-conditions" replace />}
            />
            <Route
              path="terms-and-conditions"
              element={<><SEO title="Terms & Conditions | todo." description="Read the terms of service and conditions for using todo. task management tools." /><TermsAndConditions /></>}
            />
            <Route path="privacy-policy" element={<><SEO title="Privacy Policy | todo." description="Learn how todo. protects and manages your personal data, verification info, and tasks." /><PrivacyPolicy /></>} />
            <Route path="cookie-policy" element={<><SEO title="Cookie Policy | todo." description="Read about how todo. uses cookies and local storage to keep you logged in and personalize your settings." /><CookiePolicy /></>} />
            <Route path="delete-my-data" element={<><SEO title="Delete My Data | todo." description="Request account deletion and complete erasure of your tasks, email, and user data from todo.." /><DeleteMyData /></>} />
            <Route path="disclaimer" element={<><SEO title="Disclaimer | todo." description="Legal disclaimer and limitations of liability for the todo. productivity application." /><Disclaimer /></>} />
            <Route path="refund-policy" element={<><SEO title="Refund Policy | todo." description="Learn about billing policies, subscriptions, and refund eligibility for todo. accounts." /><RefundPolicy /></>} />
            <Route path="accessibility" element={<><SEO title="Accessibility Statement | todo." description="Read about our commitment to making todo. accessible and user-friendly for everyone." /><Accessibility /></>} />
          </Route>

          {/* Fallbacks & Debug */}
          <Route path="/loader" element={<><SEO title="Loading | todo." description="Setting up your workspace..." /><LoadingPage /></>} />
          <Route path="/error" element={<><SEO title="Page Not Found | todo." description="Oops! The page you are looking for does not exist on todo.." /><ErrorPage /></>} />
          <Route path="*" element={<><SEO title="Page Not Found | todo." description="Oops! The page you are looking for does not exist on todo.." /><ErrorPage /></>} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </>
  );
}

export default AuthenticationPage;
