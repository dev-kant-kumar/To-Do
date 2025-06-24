import { useState, useEffect } from "react";
import TodoIllustrationForSignUp from "../assets/TodoSignUp.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import global from "../Components/Global";
import { Eye, EyeOff } from "lucide-react";

function SignUpForm() {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [haveError, setHaveError] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState({
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

  const checkErrors = () => {
    let errors = {};
    let messages = {};

    // Name validation
    if (inputValue.name.length == 0) {
      errors.name = true;
      messages.name = "Please enter name!";
    } else if (/[^a-zA-Z\s]/.test(inputValue.name)) {
      errors.name = true;
      messages.name = "Name can only have letters!";
    } else if (inputValue.name.length < 3 || inputValue.name.length > 20) {
      errors.name = true;
      messages.name = "Name should be between 3 to 20 chars only!";
    }

    // Username validation
    if (inputValue.username.length == 0) {
      errors.username = true;
      messages.username = "Please enter username!";
    } else if (/[^a-zA-Z0-9]/.test(inputValue.username)) {
      errors.username = true;
      messages.username = "Username can only have letters and numbers!";
    } else if (!isNaN(inputValue.username[0])) {
      errors.username = true;
      messages.username = "Username can't start with a number!";
    } else if (
      inputValue.username.length < 3 ||
      inputValue.username.length > 15
    ) {
      errors.username = true;
      messages.username = "Username should be between 3 to 15 chars only!";
    }

    // Email validation
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    if (inputValue.email.length == 0) {
      errors.email = true;
      messages.email = "Please enter email!";
    } else if (!emailRegex.test(inputValue.email)) {
      errors.email = true;
      messages.email = "Invalid email format!";
    }

    // Password validation
    const password = inputValue.password;
    if (password.length == 0) {
      errors.password = true;
      messages.password = "Please enter password!";
    } else if (!/[a-z]/.test(password)) {
      errors.password = true;
      messages.password =
        "Password must contain at least one lowercase letter!";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = true;
      messages.password =
        "Password must contain at least one uppercase letter!";
    } else if (!/[0-9]/.test(password)) {
      errors.password = true;
      messages.password = "Password must contain at least one number!";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = true;
      messages.password =
        "Password must contain at least one special character!";
    } else if (password.length < 8 || password.length > 20) {
      errors.password = true;
      messages.password = "Password must be between 8 to 20 chars long!";
    }
    if (inputValue.confirmPassword.length == 0) {
      errors.confirmPassword = true;
      messages.confirmPassword = "Please enter confirm password!";
    }

    // Confirm password validation
    if (inputValue.password !== inputValue.confirmPassword) {
      errors.confirmPassword = true;
      messages.confirmPassword = "Passwords do not match!";
    }

    return { errors, messages };
  };

  const formValidation = (e) => {
    e.preventDefault();

    const { errors, messages } = checkErrors();

    setHaveError(errors);
    setErrorMessage(messages);

    if (Object.keys(errors).length === 0) {
      sendDataToBackend();
    } else {
      toast.error("Please fill all the required fields");
    }
  };

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
      <h1 id="logo" className="logo-for-sigIn-signUp-page">
        to<span>do</span>.
      </h1>
      <img
        src={TodoIllustrationForSignUp}
        alt="TodoIllustration"
        id="main-img"
      />

      <form
        action=""
        className="SignUp-signIn-form bg-black/30"
        onSubmit={formValidation}
      >
        <h2 className="text-2xl font-bold text-center mt-5 mb-2.5">Sign Up</h2>
        <p className="text-gray-400 text-center mb-2.5">
          Create your account to get started
        </p>

        <input
          type="text"
          name="name"
          value={inputValue.name}
          placeholder="Name"
          onChange={handleFormInput}
          className="border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear"
        />
        <p
          className={
            haveError.name
              ? "sigUp-form-validation-error-display-field-active"
              : "sigUp-form-validation-error-display-field"
          }
        >
          {errorMessage.name}
        </p>

        <input
          type="text"
          className="border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear"
          name="username"
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

        <input
          type="email"
          name="email"
          className="border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear"
          value={inputValue.email}
          placeholder="Email Id"
          onChange={handleFormInput}
        />
        <p
          className={
            haveError.email
              ? "sigUp-form-validation-error-display-field-active"
              : "sigUp-form-validation-error-display-field"
          }
        >
          {errorMessage.email}
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

        <div className="password-field border border-gray-600 hover:border-purple-800 transition-colors delay-100 duration-300 ease-linear">
          <input
            className="pf-password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={inputValue.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleFormInput}
          />
          <div className="pf-img">
            <div className="pf-img" onClick={confirmPasswordHandler}>
              {showConfirmPassword ? <Eye /> : <EyeOff />}
            </div>
          </div>
        </div>
        <p
          className={
            haveError.confirmPassword
              ? "sigUp-form-validation-error-display-field-active"
              : "sigUp-form-validation-error-display-field"
          }
        >
          {errorMessage.confirmPassword}
        </p>

        <div id="terms-conditions">
          <input type="checkbox" id="for-checkbox" required />
          <label htmlFor="for-checkbox">
            <span className="text-gray-400"> Agree With </span>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </label>
        </div>

        <input
          type="submit"
          value="Sign Up"
          disabled={signUpBtnDisable}
          className="text-white bg-gradient-to-b from-purple-600 to-fuchsia-950 outline-0 border-0 cursor-pointer hover:from-purple-700"
        />

        <div id="login-section">
          <p className="text-gray-400">Already have an account? </p>
          <Link to="/login">Login Here</Link>
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;
