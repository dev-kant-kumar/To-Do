import React, { useState, useEffect } from "react";
import openEye from "../assets/heroicons-solid--eye.png";
import closeEye from "../assets/tabler--eye-off.png";
import TodoIllustrationForSignUp from "../assets/TodoSignUp.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import global from "../Components/Global";
function SignUpForm() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signUpBtnDisable, setSignUpBtnDisable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const passwordHandler = () => {
    setShowPassword(!showPassword);
  };

  const confirmPasswordHandler = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFormInput = (e) => {
    const { name, value } = e.target;
    setInputValue((prevState) => ({ ...prevState, [name]: value }));
  };

  function formValidation(e) {
    e.preventDefault();
    if (inputValue.password === inputValue.confirmPassword) {
      sendDataToBackend();
    } else {
      toast.error("Passwords do not match");
    }
  }

  const sendDataToBackend = async () => {
    await axios
      .post(apiUrl + "user/signup", {
        name: inputValue.name,
        username: inputValue.username,
        email: inputValue.email,
        password: inputValue.password,
      })
      .then((res) => {
        if (res.data.status === true) {
          toast.success(res.data.message);
          toast("Welcome onboard! please login to start managing tasks");
          navigate("/login");
        } else {
          toast.info(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err.response.data);
        toast.error("Error occurred during signup!");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    token ? navigate("/home") : null;
  }, []);

  return (
    <div className="form-main-container">
      <img
        src={TodoIllustrationForSignUp}
        alt="TodoIllustration"
        id="main-img"
      />
      <form action="" className="SignUp-signIn-form" onSubmit={formValidation}>
        <h2>Sign Up</h2>

        <input
          type="text"
          name="name"
          value={inputValue.name}
          placeholder="Name"
          onChange={handleFormInput}
          required
        />
        <p className="sigUp-form-validation-error-display-field">
          {"name is required"}
        </p>

        <input
          type="text"
          className=""
          name="username"
          value={inputValue.username}
          placeholder="Username"
          onChange={handleFormInput}
          required
        />
        <p className="sigUp-form-validation-error-display-field">
          {"name is required"}
        </p>

        <input
          type="email"
          name="email"
          className=""
          value={inputValue.email}
          placeholder="Email Id"
          onChange={handleFormInput}
          required
        />
        <p className="sigUp-form-validation-error-display-field">
          {"name is required"}
        </p>

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
            alt="reveal password/show password icon"
            className="set-view-password"
            onClick={passwordHandler}
          />
        </div>
        <p className="sigUp-form-validation-error-display-field">
          {"name is required"}
        </p>

        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={inputValue.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleFormInput}
            required
          />
          <img
            src={showConfirmPassword ? openEye : closeEye}
            alt="reveal password/show password icon"
            className="set-view-password"
            onClick={confirmPasswordHandler}
          />
        </div>
        <p className="sigUp-form-validation-error-display-field">
          {"name is required"}
        </p>

        <div id="terms-conditions">
          <input type="checkbox" required />
          <p>
            Agree With{" "}
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
          </p>
        </div>

        <input
          type="submit"
          value="Sign Up"
          disabled={signUpBtnDisable}
          className={signUpBtnDisable ? "disable-btn" : "sig-up-btn-active"}
        />

        <div id="login-section">
          <p>Already have an account? </p>
          <Link to="/login">Login Here</Link>
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;
