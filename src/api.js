const BASE = "https://chatify-api.up.railway.app";
const withCreds = { credentials: "include" };

export async function getCsrf() {
  //Csrf = Cross-Site Request Forgery - CSRF-token är som ett “hemliga handslag” som skickas med varje känslig förfrågan, så servern vet att den kommer från din riktiga frontend och inte från någon annan sida.
  const res = await fetch(`${BASE}/csrf`, { method: "PATCH", ...withCreds });
  const data = await res.json();
  if (!res.ok) throw new Error("CSRF failed");

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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Visa exakt feltext från API:t om den finns
    throw new Error(data?.message || `Login failed (${res.status})`);
  }
  const token =
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.access_token ||
    data.access;

  if (!token) throw new Error("No token in response");
  return { accessToken: token };
}
