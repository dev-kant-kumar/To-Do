import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Store";
import Authentication from "../src/Pages/AuthenticationPage.jsx";
import axios from "axios";
import { getToken } from "./utils/auth";
import { initSyncManager } from "./utils/syncManager";

// Configure global Axios interceptor to automatically attach X-Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["X-Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize offline capability sync manager
initSyncManager();

import { BackgroundProvider } from "./hooks/useBackground";
import ErrorBoundary from "./Components/ErrorBoundary";

// Global uncaught promise rejection tracker
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[App] Unhandled Promise Rejection:", event.reason);
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BackgroundProvider>
      <ErrorBoundary>
        <Authentication />
      </ErrorBoundary>
    </BackgroundProvider>
  </Provider>
);

