import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listMessages, sendMessage } from "../api";

export default function Chat() {
  const { user, token } = useAuth();
  const [msg, setMsg] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setErr("");
      setLoading(true);
      try {
        const data = await listMessages(token);
        if (!ignore) setMsg(data);
      } catch (e) {
        if (!ignore) setErr(e.message || "Kunde inte hämta meddelanden.");
      } finally {
        if (!ignore) setLoading(false);
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          0
        );
      }
    }

    load();

    const id = setInterval(load, 5000);

    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [token]);

  //vems meddelande ?
  function isMine(m) {
    //API:et kan heta userId/id/authorId - jag stödjer några varianter
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

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    setErr("");

    //optimistisk uppdatering
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      createdAt: new Date().toISOString(),
      username: user?.username ?? "jag",
      userId: user?.id,
      __optimistic: true,
    };

    setMsg((prev) => [...prev, optimistic]);
    setDraft("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

    try {
      const saved = await sendMessage(text, token);
      //ersätt temp med riktiga objektet
      //setMsg((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (e) {
      //vid fel: ta bort temp + visa fel
      setMsg((prev) => prev.filter((m) => m.id !== tempId));
      setErr(e.message || "Kunde inte skicka.");
      setDraft(text); //lägg tillbaka i input
    } finally {
      setSending(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        0
      );
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-2 max-w-3xl mx-auto px-3 overflow-hidden">
      <h2 className="text-xl font-semibold my-3">Meddelanden</h2>

      {!loading && !err && msg.length === 0 && (
        <p className="opacity-70">Inga meddelanden ännu.</p>
      )}

      {loading && <p className="opacity-70"></p>}
      {err && <p className="text-error">{err}</p>}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {msg.map((m) => {
          const mine = isMine(m);
          const time = m.createdAt || m.created_at || m.timestamp;
          const when = time ? new Date(time).toLocaleDateString() : "";
          const text = m.text ?? m.content ?? "";

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

      {/* Composer */}
      <form onSubmit={handleSend} className="mt-2 flex gap-2">
        <input
          className="input input-bordered flex-1"
          placeholder="Skriv ett meddelande..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn btn-primary" disabled={sending || !draft.trim()}>
          {sending ? "Skickar..." : "Skicka"}
        </button>
      </form>
    </div>
  );
}
