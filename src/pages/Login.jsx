// Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // 🆕 ADDED: Link + flyttad import

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("Loggar in...");

    try {
      await login({ username, password });
      navigate("/chat", { replace: true }); // gå direkt till chatten
    } catch (err) {
      setMsg("Fel användarnamn/lösenord"); // visa fel
      console.error("Login failed:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5">
      <div className="card bg-gray-200 shadow-xl p-5">
        <p className="pb-5 text-gray-700 text-xl">Logga in</p>
        <form
          onSubmit={handleLogin}
          className="flex flex-wrap gap-2 items-center"
        >
          <input
            className="input input-bordered border-2 border-gray-400 bg-white text-gray-700 w-full"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input input-bordered border-2 border-gray-400 bg-white text-gray-700 w-full"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="btn btn-secondary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
        {msg && <p className="mt-3 text-sm text-red-500 opacity-80">{msg}</p>}
        <p className="mt-5 text-sm text-gray-700">
          Saknar konto?{" "}
          <Link className="link link-primary" to="/register">
            Registrera dig här
          </Link>
        </p>
      </div>
    </div>
  );
}
