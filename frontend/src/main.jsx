import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Store";
import Authentication from "../src/Pages/AuthenticationPage.jsx";
import axios from "axios";

// Configure global Axios interceptor to automatically attach X-Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["X-Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Authentication />
  </Provider>
);
