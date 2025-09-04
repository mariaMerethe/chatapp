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
  const msgsRef = useRef([]); // så svaren ligger kvar (minns senaste listan för merge)
  useEffect(() => {
    msgsRef.current = msg;
  }, [msg]);

  //tid och sortering
  function tsOf(m) {
    const t = m.createdAt ?? m.created_at ?? m.timestamp;
    if (typeof t === "number") return t;
    const d = Date.parse(t);
    return Number.isFinite(d) ? d : 0;
  }

  function fmtTime(t) {
    const isoToShortTimeFormat =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?Z)?$/;
    if (!isoToShortTimeFormat.test(t) || !t) return;
    return t.slice(0, 16).replace("T", " ");
  }

  function sortByTime(a, b) {
    return tsOf(a) - tsOf(b);
  }

  //lokal persistens
  const localKey = user
    ? `chat.local.${user.id || user.userId || user.username}`
    : null;

  //läs lokalt
  useEffect(() => {
    if (!localKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(localKey) || "[]");
      if (Array.isArray(saved) && saved.length) {
        setMsg((cur) => [...cur, ...saved].sort(sortByTime));
      }
    } catch {}
  }, [localKey]);

  //spara lokalt (endast _local)
  useEffect(() => {
    if (!localKey) return;
    const locals = msg.filter((m) => m._local === true);
    try {
      localStorage.setItem(localKey, JSON.stringify(locals));
    } catch {}
  }, [msg, localKey]);

  //laddning + polling
  useEffect(() => {
    let ignore = false;

    //1. laddningsfunktion
    async function load({ showSpinner = false } = {}) {
      setErr("");
      if (showSpinner) setLoading(true);
      try {
        const data = await listMessages(token);
        if (!ignore) {
          const serverList = Array.isArray(data) ? data : [];
          const serverIds = new Set(serverList.map((m) => m.id));

          //behåll eventuella _local som inte finns på servern
          const localsToKeep = (msgsRef.current || []).filter(
            (m) => m?._local && !serverIds.has(m.id)
          );

          const merged = [...serverList, ...localsToKeep].sort(sortByTime);
          setMsg(merged);

          //auto-scroll vid nytt sista meddelande
          const last = merged.at(-1);
          const key = last ? `${last.id ?? "noid"}-${tsOf(last)}` : "";

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
        if (!ignore && showSpinner) setLoading(false); //stäng spinner bara när vi visade den
      }
    }

    //första laddningen
    load({ showSpinner: true });

    //2. poll var 15s utan spinner
    const id = setInterval(() => load({ showSpinner: false }), 15000);

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
    const myId = user?.id ?? user?.userId;
    const msgUserId = m.userId ?? m.authorId ?? m.user?.id ?? m.user_id;

    const myName = user?.username ?? user?.user;
    const msgName = m.username ?? m.user?.username ?? m.user?.name;

    return (
      (msgUserId && myId && msgUserId === myId) ||
      (msgName && myName && msgName === myName)
    );
  }

  //skicka medddelande-funktion
  async function handleSend(e) {
    e.preventDefault();

    let text = draft.trim();
    if (!text) return;
    //enkel sanering: ta bort taggar
    text = text.replace(/<[^>]*>/g, "");

    setSending(true);
    setErr("");

    const tempId = `tmp-${Date.now()}`;

    // TODO: Se över detta, nuvarande i millisekundrar.
    // Du behöver en datumsträng som liknar createdAt.
    // Tänk på tid diff!
    const nowMs = Date.now();

    //optimistisk uppdatering
    const optimistic = {
      id: tempId,
      text,
      createdAt: nowMs,
      username: user?.username ?? "jag",
      userId: user?.id,
      __optimistic: true,
    };

    //lägg till min bubbla
    setMsg((prev) => [...prev, optimistic].sort(sortByTime));
    setDraft("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

    try {
      await sendMessage(text, token);

      //enkelt bot-svar, direkt efter min bubbla (interleaving)
      setTimeout(() => {
        setMsg((prev) => {
          const list = [...prev];
          const idx = list.findIndex((m) => m.id === tempId);

          const bot = {
            id: `bot-${Date.now()}`,
            text: "Akta så jag inte bannar dig, var lite trevligare ;)",
            createdAt: nowMs,
            username: "Anna",
            userId: "bot",
            _local: true,
          };
          if (idx >= 0) {
            list.splice(idx + 1, 0, bot);
          } else {
            list.push(bot);
          }
          return list.sort(sortByTime);
        });
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

  //radera meddelande-funktion
  async function handleDelete(m) {
    //bara egna ska kunna raderas i UI
    if (!isMine(m)) return;
    const prev = msg;
    setMsg((cur) => cur.filter((x) => x.id !== m.id));
    try {
      await deleteMessage(m.id, token);
    } catch (e) {
      setMsg(prev); //ångrar om API felar
      setErr(e.message || "Kunde inte radera meddelandet.");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] card shadow-xl m-10 bg-gray-200 p-5 max-w-3xl mx-auto px-3 overflow-x-hidden">
      <h2 className="text-xl text-gray-700 pb-4 font-semibold">Meddelanden</h2>

      {!loading && !err && msg.length === 0 && (
        <p className="opacity-70">Inga meddelanden ännu.</p>
      )}

      {loading && <p className="opacity-70">Laddar...</p>}
      {err && <p className="text-error">{err}</p>}

      {/* Lista, scrollbara ytan */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pb-4">
        {msg.map((m) => {
          const mine = isMine(m);
          const when = fmtTime(m.createdAt || m.created_at || m.timestamp);
          const text = m.text ?? m.content ?? "";

          return (
            <div
              key={m.id ?? `${m.username}-${tsOf(m)}-${text.slice(0, 10)}`}
              className={`chat ${
                mine ? "chat-end" : "chat-start"
              } relative pr-8 group`}
            >
              {/* namn över bubblan (endast om inte jag) */}
              {!mine && (
                <div className="chat-header text-gray-500 mb-0.5">
                  {m.username ??
                    m.user?.username ??
                    m.user?.name ??
                    "Användare"}
                </div>
              )}

              {/* bubbla */}

              <div
                className={`chat-bubble ${mine ? "chat-bubble-primary" : ""}`}
              >
                {text}
              </div>

              {/* tid under bubblan */}
              <div className="chat-footer text-xs">{when}</div>

              {/* radera-knapp (egna) */}
              {mine && m.id && !m.__optimistic && (
                <button
                  className="btn btn-xs btn-ghost text-gray-500 absolute right-2 top-2"
                  title="Radera"
                  onClick={() => handleDelete(m)}
                >
                  X
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="mt-2 flex gap-2">
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
