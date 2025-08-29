import { createContext, useContext, useEffect, useState } from "react";
import { getCsrf, getToken } from "../api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  //state
  const [user, setUser] = useState(null); // t.ex. { id, username }
  const [token, setToken] = useState(null); // JWT-strängen
  const [ready, setReady] = useState(false);

  // --- Rehydrera vid app-start (hålla kvar inloggning efter reload)
  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    if (stored) {
      try {
        const payload = jwtDecode(stored);
        setToken(stored);
        setUser(payload);
        console.log("Decoded payload:", payload);
      } catch {
        // ogiltig/korrupt token → rensa upp
        localStorage.removeItem("access_token");
      }
    }
    setReady(true);
  }, []);

  //funktioner
  async function login({ username, password }) {
    //1. hämta CSRF-token (kräver credentials: 'include' i api.js)
    const csrfToken = await getCsrf();

    //2. logga in och få accessToken från backend
    const { accessToken } = await getToken({
      username,
      password,
      csrfToken, // FIX: skicka rätt variabelnamn
    });

    //3. spara token + avkoda payload → user
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);

    const payload = jwtDecode(accessToken); //t.ex. { id, username, exp ... }
    setUser(payload);

    return payload; //så Login.jsx kan visa direkt
  }

  function logout() {
    //nollställ allt
    localStorage.removeItem("access_token");
    setUser(null);
    setToken(null);
  }

  //exportera värden till barn
  return (
    <AuthContext.Provider value={{ user, token, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

//liten hjälpfunktion för att hämta context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
