// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("Loggar in...");
    try {
      const payload = await login({ username, password });

      // fallback för olika fältnamn i JWT
      const displayName =
        payload?.username ??
        payload?.name ??
        payload?.user?.username ??
        payload?.sub ??
        "(okänt namn)";

      setMsg(`Inloggad som ${displayName}`);
      console.log("JWT payload:", payload);
    } catch (err) {
      setMsg("Fel användarnamn/lösenord");
      console.error("Login failed:", err.message || err);
    } finally {
      setLoading(false);
    }
  }

  // samma fallback när vi visar aktiv användare
  const activeName =
    user?.username ?? user?.name ?? user?.user?.username ?? user?.sub;

  return (
    <form onSubmit={handleLogin}>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      {msg && <p>{msg}</p>}
      {activeName && <p>Aktiv användare: {activeName}</p>}
    </form>
  );
}
