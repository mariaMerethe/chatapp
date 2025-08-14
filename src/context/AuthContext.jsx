import { createContext, useContext, useState } from "react";
import { getCsrf, getToken } from "../api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1) state
  const [user, setUser] = useState(null); // t.ex. { id, username }
  const [token, setToken] = useState(null); // JWT-strängen

  // 2) funktioner
  async function login({ username, password }) {
    try {
      // 1) hämta CSRF-token (kräver credentials: 'include' i api.js)
      const csrf = await getCsrf();

      // 2) logga in och få accessToken från backend
      const { accessToken } = await getToken({
        username,
        password,
        csrfToken: csrf,
      });

      // 3) spara token + avkoda payload → user
      localStorage.setItem("access_token", accessToken);
      setToken(accessToken);

      const payload = jwtDecode(accessToken); // t.ex. { id, username, exp ... }
      console.log("JWT payload:", payload);
      setUser({ ...payload });

      return payload; // så Login.jsx kan visa direkt
    } catch (err) {
      // Skicka vidare felet så att Login.jsx kan visa ett snällt meddelande
      throw err;
    }
  }

  function logout() {
    //nollställ allt
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
  }

  // 3) exportera värden till barn
  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//liten hjälpfunktion för att hämta context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
