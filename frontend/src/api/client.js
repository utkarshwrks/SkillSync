import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const client = axios.create({ baseURL, timeout: 60000 });

export const TOKEN_KEY = "skillsync_token";

// Attach the auth token (if any) to every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// On a genuine 401, log the user out *consistently* — clear the token AND
// tell the app to reset the in-memory user. Previously we only cleared the
// token, leaving a broken "half-logged-in" state where the UI thought you
// were signed in but every request silently failed (e.g. Analyze Resume
// bouncing you to login). The event lets AuthContext null the user + redirect.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("skillsync:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default client;
