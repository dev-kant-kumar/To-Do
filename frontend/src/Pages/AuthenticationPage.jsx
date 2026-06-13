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
          <Route path="/" element={<LandingPage />} />

          {/* Auth (Guest Only) */}
          <Route element={<GuestRoute />}>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          </Route>

          {/* App Pages (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Legal Pages - Nested (Public) */}
          <Route path="/legal" element={<LegalLayout />}>
            <Route
              index
              element={<Navigate to="terms-and-conditions" replace />}
            />
            <Route
              path="terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="cookie-policy" element={<CookiePolicy />} />
            <Route path="delete-my-data" element={<DeleteMyData />} />
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="accessibility" element={<Accessibility />} />
          </Route>

          {/* Fallbacks & Debug */}
          <Route path="/loader" element={<LoadingPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
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
