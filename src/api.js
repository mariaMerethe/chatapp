const BASE = "https://chatify-api.up.railway.app";

// hjälp: alltid skicka cookies (som Postman gör)
const withCreds = { credentials: "include" };

export async function getCsrf() {
  const res = await fetch(`${BASE}/csrf`, { method: "PATCH", ...withCreds });
  if (!res.ok) throw new Error("CSRF failed");
  const data = await res.json();
  // kolla vad vi fick
  console.log("CSRF response:", data);
  return data.csrfToken;
}

export async function getToken({ username, password, csrfToken }) {
  const res = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, csrfToken }),
    ...withCreds,
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  console.log("Token response:", data); // <-- se exakt nyckeln
  // försök plocka token oavsett nyckelnamn
  const token =
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.access_token ||
    data.access;

  if (!token) throw new Error("No token in response");
  return { accessToken: token };
}
