import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteMessage, listMessages, sendMessage } from "../api";

export default function Chat() {
  const { user, token } = useAuth();

  //state
  const [msg, setMsg] = useState([]);
  const [loading, setLoading] = useState(true); //visa spinner bara första laddningen
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  //refs
  const bottomRef = useRef(null);
  const lastMsgKeyRef = useRef(null); //för att bara auto-scrolla när det faktiskt kommit nytt
  const inputRef = useRef(null); //autofocus på input

  useEffect(() => {
    let ignore = false;

    //1. laddningsfunktion där jag väljer om spinner ska visas
    async function load({ showSpinner = false } = {}) {
      setErr("");
      if (showSpinner) setLoading(true);
      try {
        const data = await listMessages(token);

        if (!ignore) {
          setMsg(data);

          //kolla om sista meddelandet har ändrats → då auto-scrolla
          const last = data.at(-1);
          const key =
            last?.id ??
            (last
              ? `${last.username}-${
                  last.createdAt || last.created_at || last.timestamp
                }-${(last.text || last.content || "").slice(0, 10)}`
              : "");

          if (key && key !== lastMsgKeyRef.current) {
            lastMsgKeyRef.current = key;
            setTimeout(
              () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
              0
            );
          }
        }
      } catch (e) {
        if (!ignore) setErr(e.message || "Kunde inte hämta meddelanden.");
      } finally {
        if (!ignore && showSpinner) setLoading(false); // stäng spinner bara när vi visade den
      }
    }

    //första laddningen -> visa "Laddar..."
    load({ showSpinner: true });

    //2. poll var 5s utan spinner
    const id = setInterval(() => load({ showSpinner: false }), 5000);

    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [token]);

  //autofocus på input vid mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    let text = draft.trim();
    if (!text) return;
    text = text.replace(/<[^>]*>/g, "");

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
      await sendMessage(text, token);
      //enkel "bot"-feedback i UI (klient-sida, sparas ej i API)
      setTimeout(() => {
        setMsg((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: "🪄 Okej! Jag såg ditt meddelande.",
            createdAt: new Date().toDateString(),
            username: "Anna",
            userId: "bot",
            __local: true,
          },
        ]);
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          0
        );
      }, 700);
    } catch (e) {
      //vid fel: ta bort temp + visa fel + lägg tillbaka i input
      setMsg((prev) => prev.filter((m) => m.id !== tempId));
      setErr(e.message || "Kunde inte skicka.");
      setDraft(text);
    } finally {
      setSending(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        0
      );
    }
  }

  async function handleDelete(m) {
    //bara egna ska kunna raderas i UI
    if (!isMine(m)) return;

    const prev = msg;
    setMsg((cur) => cur.filter((x) => x.id !== m.id));

    try {
      await deleteMessage(m.id, token);
      //klart
    } catch (e) {
      //ångrar om API felar
      setMsg(prev);
      setErr(e.message || "Kunde inte radera meddelandet.");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-2 max-w-3xl mx-auto px-3 overflow-hidden">
      <h2 className="text-xl font-semibold my-3">Meddelanden</h2>

      {!loading && !err && msg.length === 0 && (
        <p className="opacity-70">Inga meddelanden ännu.</p>
      )}

      {loading && <p className="opacity-70">Laddar...</p>}
      {err && <p className="text-error">{err}</p>}

      {/* Lista, scrollbara ytan */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {msg.map((m) => {
          const mine = isMine(m);
          const time = m.createdAt || m.created_at || m.timestamp;
          const when = time
            ? new Date(time).toLocaleDateString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "";
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
              <div className="flex items-center gap-2">
                {/* bubblan */}
                <div
                  className={`chat-bubble ${mine ? "chat-bubble-primary" : ""}`}
                >
                  {text}
                </div>

                {/* radera-knapp för egna */}
                {mine && m.id && !m.__optimistic && (
                  <button
                    className="btn btn-xs"
                    title="Radera"
                    onClick={() => handleDelete(m)}
                  >
                    X
                  </button>
                )}
              </div>

              <div className="chat-footer opacity-60">{when}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="mt-2 flex gap-2">
        {/*bytte iput till textarea för att kunna göra radbrytning*/}
        <input
          ref={inputRef}
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
