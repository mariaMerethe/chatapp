import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { getCsrf, getToken } from "./api";
import { jwtDecode } from "jwt-decode";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Kör en gång vid start
(async () => {
  try {
    const csrf = await getCsrf();
    const { accessToken } = await getToken({
      username: "maria_test123",
      password: "test123",
      csrfToken: csrf,
    });

    console.log("JWT:", accessToken);
    localStorage.setItem("access_token", accessToken);

    const payload = jwtDecode(accessToken);
    console.log("Decoded:", payload);
  } catch (err) {
    console.error("Auth bootstrap failed:", err);
  }
})();
