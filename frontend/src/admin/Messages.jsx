import { useState, useRef, useEffect, useCallback } from "react";
import { G, Card } from "./shared.jsx";
import {
  fetchAllMessageContacts,
  fetchConversation,
  sendMessageTo,
} from "../api.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const Avatar = ({ name = "?", size = 34 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `${G.accent}22`, display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 700, color: G.accent2,
    flexShrink: 0, fontSize: size * 0.38, textTransform: "uppercase",
  }}>
    {(name[0] || "?")}
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{
      width: 20, height: 20, borderRadius: "50%",
      border: `2px solid ${G.accent}`, borderTopColor: "transparent",
      animation: "admSpin .7s linear infinite",
    }} />
    <style>{`@keyframes admSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const roleLabel = (role) => {
  if (role === "exhibitor") return "Exhibitor";
  if (role === "attendee")  return "Attendee";
  return "Admin";
};

export default function Messages() {
  const [contacts,     setContacts]     = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loadingCtx,   setLoadingCtx]   = useState(true);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [sending,      setSending]      = useState(false);
  const [err,          setErr]          = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Load contacts ────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    setLoadingCtx(true);
    try {
      const data = await fetchAllMessageContacts();
      setContacts(data.contacts || []);
    } catch {
      setErr("Could not load contacts.");
    } finally {
      setLoadingCtx(false);
    }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // ── Open conversation ────────────────────────────────────────────────────
  const openConversation = useCallback(async (contact) => {
    setSelected(contact);
    setLoadingMsgs(true);
    setErr("");
    // Mark contact as read locally
    setContacts((prev) =>
      prev.map((c) => c.userId === contact.userId ? { ...c, unreadCount: 0 } : c)
    );
    try {
      const data = await fetchConversation(contact.userId);
      setMessages(data.messages || []);
    } catch {
      setErr("Could not load conversation.");
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // ── Send reply ────────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setInput("");
    setErr("");

    const optimistic = { id: `opt_${Date.now()}`, text, mine: true, time: "Just now" };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await sendMessageTo(selected.userId, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...res.data, mine: true } : m))
      );
      loadContacts();
    } catch (e) {
      setErr(e.message || "Failed to send.");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const totalUnread = contacts.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: G.accent, marginBottom: 4 }}>
          Communication
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-.02em", marginBottom: 4 }}>
          Messages
          {totalUnread > 0 && (
            <span style={{ marginLeft: 10, fontSize: 11, background: G.accent, color: "#fff", borderRadius: 10, padding: "2px 8px", verticalAlign: "middle" }}>
              {totalUnread} unread
            </span>
          )}
        </h2>
        <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.5 }}>
          Live communications from exhibitors and attendees.
        </p>
      </div>

      {err && (
        <div style={{ background: "rgba(239,68,68,.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,.2)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
          {err}
        </div>
      )}

      {/* ── Chat layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14, height: 500 }}>
        {/* ── Inbox / Contacts ── */}
        <div style={{ background: G.card, borderRadius: 14, border: `1px solid ${G.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${G.border}`, fontSize: 13, fontWeight: 700, color: G.text, display: "flex", alignItems: "center", gap: 8 }}>
            Inbox
            {totalUnread > 0 && (
              <span style={{ background: G.accent, color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 7px", fontWeight: 700 }}>
                {totalUnread}
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingCtx ? (
              <Spinner />
            ) : contacts.length === 0 ? (
              <div style={{ padding: 18, fontSize: 12, color: G.muted }}>
                No messages yet. Exhibitors and attendees can write to you.
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.userId}
                  onClick={() => openConversation(c)}
                  style={{
                    padding: "11px 14px", borderBottom: `1px solid ${G.border}`,
                    cursor: "pointer", transition: "all .15s",
                    background: selected?.userId === c.userId ? `${G.accent}10` : "transparent",
                    borderLeft: selected?.userId === c.userId ? `3px solid ${G.accent}` : "3px solid transparent",
                    display: "flex", gap: 10, alignItems: "center",
                  }}
                >
                  <Avatar name={c.name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: G.text, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{c.name}</span>
                      {c.unreadCount > 0 && (
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: G.accent, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: G.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                      {roleLabel(c.role)} · {c.lastMsg?.slice(0, 28)}{(c.lastMsg?.length || 0) > 28 ? "…" : ""}
                    </div>
                    {c.lastTime && (
                      <div style={{ fontSize: 10, color: G.muted, opacity: .6, marginTop: 1 }}>{c.lastTime}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Thread ── */}
        <div style={{ background: G.card, borderRadius: 14, border: `1px solid ${G.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: G.muted }}>
              <div style={{ fontSize: 36, opacity: .35 }}>📩</div>
              <div style={{ fontSize: 13 }}>Select a conversation to reply.</div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={selected.name} size={34} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: G.text }}>{selected.name}</div>
                  <div style={{ fontSize: 10, color: G.teal, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: G.teal, display: "inline-block" }} />
                    {roleLabel(selected.role)}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
                {loadingMsgs ? (
                  <Spinner />
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: G.muted, fontSize: 13, marginTop: 40 }}>
                    No messages yet.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} style={{
                      alignSelf: m.mine ? "flex-end" : "flex-start",
                      maxWidth: "68%", padding: "10px 14px",
                      borderRadius: m.mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: m.mine ? G.accent : G.card2,
                      color: m.mine ? "#fff" : G.text,
                      fontSize: 12, lineHeight: 1.6,
                    }}>
                      {!m.mine && m.senderName && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: G.accent2, marginBottom: 3 }}>
                          {m.senderName}
                        </div>
                      )}
                      {m.text}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: .6, textAlign: m.mine ? "right" : "left" }}>
                        {m.time}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 14px", borderTop: `1px solid ${G.border}`, display: "flex", gap: 8 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a reply… (Enter to send)"
                  disabled={sending}
                  style={{ flex: 1, borderRadius: 20, background: G.card2 }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  style={{
                    background: input.trim() && !sending ? G.accent : "rgba(255,255,255,.05)",
                    border: "none", borderRadius: 20,
                    color: input.trim() && !sending ? "#fff" : G.muted,
                    padding: "9px 18px", cursor: input.trim() && !sending ? "pointer" : "default",
                    fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "all .15s",
                  }}
                >
                  {sending ? "…" : "Send →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
