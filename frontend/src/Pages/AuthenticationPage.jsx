import { useEffect } from "react";
import axios from "axios";
import { Routes, Route, HashRouter } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS
import "../App.css";

// Components and Pages
import SignUp from "../Components/SignUpForm";
import SignIn from "../Components/SigninForm";
import Home from "../Pages/Home";
import ProfilePage from "./ProfilePage";
import ErrorPage from "./ErrorPage";
import TermsAndConditionsPage from "./TermsAndConditionsPage";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../Store/Reducers/UserSlice";
import { setPreLoader } from "../Store/Reducers/Loader";

// Config
import global from "../Components/Global";

function AuthenticationPage() {
  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const { preloader } = useSelector((state) => state.Loader);

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
        }
      })
      .catch(console.error)
      .finally(() => dispatch(setPreLoader(false)));
  }, [apiUrl, dispatch]);

  if (preloader) {
    return (
      <div className="preloader">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditionsPage />}
          />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </HashRouter>

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
