import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrf, registerUser } from "../api";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      //1) hämta CSRF-token
      const csrfToken = await getCsrf();

      //2) kör registrering (avatar valfritt - vi skickar en enkel placeholder)
      await registerUser({
        username,
        email,
        password,
        avatar: "https://i.pravatar.cc/150?u=" + encodeURIComponent(username),
        csrfToken,
      });

      //3) klar! visa feedback och skicka till login
      setMsg("Kontot skapades! Skickar dig till inloggningen...");
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      //API kan t.ex. svara "Username or email already exists"
      setMsg(err.message || "Något gick fel vid registrering.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-x-2 space-y-2">
      <div className="flex gap-2">
        <input
          className="input input-bordered w-full max-w-xs"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="input input-bordered w-full max-w-xs"
          placeholder="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input input-bordered w-full max-w-xs"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-secondary" type="submit" disabled={loading}>
          {loading ? "Registrerar..." : "Registrera"}
        </button>
      </div>

      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </form>
  );
}
