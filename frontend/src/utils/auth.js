export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const setToken = (token, keepSignedIn) => {
  if (keepSignedIn) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
};

export const removeToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

export const clearAuth = () => {
  localStorage.clear();
  sessionStorage.clear();
};
