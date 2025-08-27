import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listMessages } from "../api";

export default function Chat() {
  const { user, token } = useAuth();
  const [msg, setMsg] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!token) return; //vänta tills vi har en token
      setLoading(true);
      setErr("");
      try {
        const data = await listMessages(token);
        console.log("messages:", data); //tillfälligt, för att se svaret
        if (!ignore) setMsg(data);
      } catch (e) {
        if (!ignore) setErr(e.message || "Kunde inte hämta meddelanden.");
      } finally {
        if (!ignore) setLoading(false);
        //skrolle ner efter render
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [token]);

  //vems meddelande ?
  function isMine(m) {
    //API:et kan heta userId/id/authorId - vi stödjer några varianter
    const myId = user?.id ?? user?.userId;
    const msgUserId = m.userId ?? m.authorId ?? m.user?.id ?? m.user_id;

    //fallback: jämför username
    const myName = user?.username ?? user?.user;
    const msgName = m.username ?? m.user?.username ?? m.user?.name;

    return (
      (msgUserId && myId && msgUserId === myId) ||
      (msgName && myName && msgName === myName)
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-3">
      <h2 className="text-xl font-semibold my-3">Meddelanden</h2>

      {!loading && !err && msg.length === 0 && (
        <p className="opacity-70">Inga meddelanden ännu.</p>
      )}

      {loading && <p className="opacity-70">Laddar...</p>}
      {err && <p className="text-error">{err}</p>}

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {msg.map((m) => {
          const mine = isMine(m);
          const time = m.createdAt || m.created_at || m.timestamp;
          const when = time ? new Date(time).toLocaleDateString() : "";
          const text = m.text ?? m.message ?? m.content ?? "";

          return (
            <div
              key={m.id ?? `${m.username}-${time}-${text.slice(0, 10)}`}
              className={`chat ${mine ? "chat-end" : "chat-start"}`}
            >
              {/*visa anvsändare endast om det inte är jag */}
              {!mine && (
                <div className="chat-header opacity-70 mb-0.5">
                  {m.username ??
                    m.user?.username ??
                    m.user?.name ??
                    "Användare"}
                </div>
              )}
              <div
                className={`chat-bubble ${mine ? "chat-bubble-primary" : ""}`}
              >
                {text}
              </div>
              <div className="chat-footer opacity-60">{when}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
