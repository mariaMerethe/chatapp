const BASE = "https://chatify-api.up.railway.app";
const withCreds = { credentials: "include" };

//1) hämta CSRF (måste ske med credentials så cookien sätts)
export async function getCsrf() {
  //Csrf = Cross-Site Request Forgery - CSRF-token är som ett “hemliga handslag” som skickas med varje känslig förfrågan, så servern vet att den kommer från din riktiga frontend och inte från någon annan sida.
  const res = await fetch(`${BASE}/csrf`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = await res.json();
  console.log("CSRF response:", data);
  return data.csrfToken; //t.ex. en GUID-sträng
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

export async function registerUser({
  username,
  email,
  password,
  avatar,
  csrfToken,
}) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", //viktigt för CSRF-cookien
    body: JSON.stringify({ username, email, password, avatar, csrfToken }),
  });

  //API svarar 409 vid dublett (username/email) - låt oss bubbla upp texten
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || "Registration failed";
    throw new Error(msg);
  }
  return data; //t.ex. { id, username, ... }
}

export async function listMessages(accessToken) {
  const res = await fetch(`${BASE}/messages`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    ...withCreds,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Failed to load messages (${res.status})`;
    throw new Error(msg);
  }
  return Array.isArray(data) ? data : data?.items || [];
}

export async function sendMessage(text, accessToken) {
  const res = await fetch(`${BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    ...withCreds,
    body: JSON.stringify({ text }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Failed to send (${res.status})`;
    throw new Error(msg);
  }
  return data; //API returnerar det sparade meddelandet
}
