import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { setUserInfo, clearUserInfo } from "../Store/Reducers/UserSlice";
import { setPreLoader } from "../Store/Reducers/Loader";

// Route Guards
import { ProtectedRoute, GuestRoute } from "../Components/ProtectedRoutes";

// Pages
import SignUp from "../Components/SignUpForm";
import SignIn from "../Components/SigninForm";
import Home from "../Pages/Home";
import ProfilePage from "../Pages/ProfilePage";
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

  // Fetch user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
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
      })
      .then((res) => {
        if (res.data.status) {
          const { _id, name, username, email, date } = res.data.data;
          dispatch(setUserInfo({ _id, name, username, email, date }));
        } else {
          localStorage.removeItem("token");
          dispatch(clearUserInfo());
        }
      })
      .catch((err) => {
        console.error("Authentication fetch user data failed:", err);
        localStorage.removeItem("token");
        dispatch(clearUserInfo());
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
          <Route path="/" element={<><SEO title="todo. | Simple, Clean Task Management" description="Organize your day, track your projects, and boost your daily productivity with todo. — a minimalist, high-fidelity task manager." /><LandingPage /></>} />

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
