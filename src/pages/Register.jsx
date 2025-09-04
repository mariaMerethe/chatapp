import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCsrf, registerUser } from "../api";

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
      //1. hämta CSRF-token
      const csrfToken = await getCsrf();

      //2. kör registrering (avatar valfritt - vi skickar en enkel placeholder)
      await registerUser({
        username,
        email,
        password,
        avatar: "https://i.pravatar.cc/150?u=" + encodeURIComponent(username),
        csrfToken,
      });

      //3. klar! visa feedback och skicka till login
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
    <div className="p-5">
      <div className="card bg-gray-200 shadow-xl p-5">
        <p className="pb-5 text-gray-700 text-xl">Registrera konto</p>
        <form
          onSubmit={handleSubmit}
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
            placeholder="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input input-bordered border-2 border-gray-400 bg-white text-gray-700 w-full"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            className="btn btn-secondary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrerar..." : "Registrera"}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-red-500 opacity-80">{msg}</p>}

        {/* ger möjlighet att logga in om man redan har ett konto */}
        <p className="mt-5 text-sm text-gray-700">
          Redan konto?{" "}
          <Link className="link link-primary" to="/login">
            Logga in här
          </Link>
        </p>
      </div>
    </div>
  );
}
