import React, { useState, useEffect } from "react";
import openEye from "../assets/heroicons-solid--eye.png";
import closeEye from "../assets/tabler--eye-off.png";
import TodoIllustrationForSignIn from "../assets/TodoSignIn.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../Store/Reducers/UserSlice";
import { ToastContainer, toast } from "react-toastify";
import global from "../Components/Global";
function SigninForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const [inputValue, setInputValue] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleFormInput = (e) => {
    console.log(e.target.value);
    setInputValue({ ...inputValue, [e.target.name]: e.target.value });
  };

  //Handler functions section - has - functions

  const passwordHandler = () => {
    setShowPassword(!showPassword);
  };

  const sendDataToBackend = async (e) => {
    e.preventDefault();

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
    <div className="form-main-container">
      <img src={TodoIllustrationForSignIn} alt="" id="main-img" />
      <form
        action=""
        className="SignUp-signIn-form"
        onSubmit={sendDataToBackend}
      >
        <h2>Sign In</h2>

        <input
          type="text"
          name="username"
          className="valid-input"
          value={inputValue.username}
          placeholder="Username"
          onChange={handleFormInput}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={inputValue.password}
            placeholder="Password"
            onChange={handleFormInput}
            required
          />

          <img
            src={showPassword ? openEye : closeEye}
            alt="revel password/show password icon"
            className="set-view-password"
            onClick={passwordHandler}
          />
        </div>

        <div id="stay-signed-in-and-forgot-password">
          <input type="checkbox" required />
          <p>
            Keep me signed in <a>Forgot Password?</a>
          </p>
        </div>

        <input type="submit" className="sig-up-btn-active" value="Sign In" />

        <div id="login-section-sign-In-form">
          <p>Don't have an account? </p>
          <Link to="/">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default SigninForm;
