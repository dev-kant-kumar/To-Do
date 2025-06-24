import { useState, useEffect } from "react";
import TodoIllustrationForSignIn from "../assets/TodoSignIn.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../Store/Reducers/UserSlice";
import { toast } from "react-toastify";
import global from "../Components/Global";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../Components/Common/Footer";

function SigninForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const [inputValue, setInputValue] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [haveError, setHaveError] = useState({
    username: false,
    password: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    username: "",
    password: "",
  });

  const handleFormInput = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  //Handler functions section - has - functions

  const passwordHandler = () => {
    setShowPassword(!showPassword);
  };

  const checkErrors = () => {
    let error = {};
    let messages = {};

    if (inputValue.username.length == 0) {
      error.username = true;
      messages.username = "Username cannot be empty";
    }
    if (inputValue.password.length == 0) {
      error.password = true;
      messages.password = "Password cannot be empty";
    }
    return { error, messages };
  };

  const formValidation = (e) => {
    e.preventDefault();

    const { error, messages } = checkErrors();
    setHaveError(error);
    setErrorMessage(messages);

    if (Object.keys(error).length == 0) {
      sendDataToBackend(e);
    } else {
      toast.error("Please fill all the required fields");
    }
  };

  const sendDataToBackend = async () => {
    await axios
      .post(apiUrl + "user/signin", {
        username: inputValue.username,
        password: inputValue.password,
      })
      .then((res) => {
        const { status, message } = res.data;

        if (status == true) {
          const { token, userData } = res.data;
          const { _id, name, username, email, date } = userData;

          toast.success(message);
          dispatch(setUserInfo({ _id, name, username, email, date })); //storing in store
          localStorage.setItem("token", token);
          navigate("/home");
        } else {
          toast.error(message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    token ? navigate("/home") : navigate("/login");
  }, [token]);

  return (
    <>
      <div className="form-main-container">
        <h1 id="logo" className="logo-for-sigIn-signUp-page">
          to<span>do</span>.
        </h1>
        <img src={TodoIllustrationForSignIn} alt="" id="main-img" />
        <form
          action=""
          className="SignUp-signIn-form bg-black/30"
          onSubmit={formValidation}
        >
          <h2 className="text-2xl font-bold text-center mt-5 mb-2.5">Log In</h2>
          <p className="text-gray-400 text-center mb-2.5">
            Welcome back! Log in to access your tasks
          </p>

          <input
            type="text"
            name="username"
            className="pf-password border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear"
            value={inputValue.username}
            placeholder="Username"
            onChange={handleFormInput}
          />
          <p
            className={
              haveError.username
                ? "sigUp-form-validation-error-display-field-active"
                : "sigUp-form-validation-error-display-field"
            }
          >
            {errorMessage.username}
          </p>

          <div className="password-field border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear">
            <input
              className="pf-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={inputValue.password}
              placeholder="Password"
              onChange={handleFormInput}
            />
            <div className="pf-img" onClick={passwordHandler}>
              {showPassword ? <Eye /> : <EyeOff />}
            </div>
          </div>
          <p
            className={
              haveError.password
                ? "sigUp-form-validation-error-display-field-active"
                : "sigUp-form-validation-error-display-field"
            }
          >
            {errorMessage.password}
          </p>

          <div id="stay-signed-in-and-forgot-password">
            <input type="checkbox" required id="for-checkbox" />
            <label htmlFor="for-checkbox">
              <span className="text-gray-400"> Keep me signed in</span>{" "}
              <a>Forgot Password?</a>
            </label>
          </div>

          <input
            type="submit"
            value="Log in"
            className="text-white bg-gradient-to-b from-purple-600 to-fuchsia-950 outline-0 border-0 cursor-pointer hover:from-purple-700"
          />

          <div id="login-section-sign-In-form">
            <p className="text-gray-400">Don't have an account? </p>
            <Link to="/">Sign Up</Link>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default SigninForm;
