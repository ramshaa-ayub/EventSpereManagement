import { useState, useRef, useEffect, useCallback } from "react";
import { G, ACCENT, Card } from "./shared.jsx";
import {
  fetchMessageContacts,
  fetchConversation,
  sendMessageTo,
  fetchUsers,
} from "../api.js";

// ── Role label helper ────────────────────────────────────────────────────────
const roleLabel = (role) => {
  if (role === "admin")     return "Administrator";
  if (role === "attendee")  return "Attendee";
  return "Co-Exhibitor";
};

// ── Small avatar ─────────────────────────────────────────────────────────────
const Avatar = ({ name = "?", size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `${ACCENT}20`, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: size * 0.39, fontWeight: 700,
    color: ACCENT, flexShrink: 0, textTransform: "uppercase",
  }}>
    {(name[0] || "?")}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      border: `2px solid ${ACCENT}`, borderTopColor: "transparent",
      animation: "exhSpin .7s linear infinite",
    }} />
    <style>{`@keyframes exhSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function MessagesSection({ user }) {
  const [contacts,    setContacts]    = useState([]);
  const [allUsers,    setAllUsers]    = useState([]); // all exhibitors for "New Chat"
  const [selected,    setSelected]    = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [loadingCtx,  setLoadingCtx]  = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending,     setSending]     = useState(false);
  const [err,         setErr]         = useState("");
  const [showPicker,  setShowPicker]  = useState(false);
  const bottomRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Load contacts list ───────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    setLoadingCtx(true);
    try {
      const data = await fetchMessageContacts();
      setContacts(data.contacts || []);
    } catch (e) {
      setErr("Could not load contacts.");
    } finally {
      setLoadingCtx(false);
    }
  }, []);

  // ── Load all users (for new chat picker) ─────────────────────────────────
  const loadAllUsers = useCallback(async () => {
    try {
      const all = await fetchUsers(); // returns array of user objects
      // Show other exhibitors + admin (not self)
      const filtered = all.filter(
        (u) => u._id !== user?.id && (u.role === "admin" || u.role === "exhibitor")
      );
      setAllUsers(filtered);
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    loadContacts();
    loadAllUsers();
  }, [loadContacts, loadAllUsers]);

  // ── Select a contact & load thread ──────────────────────────────────────
  const openConversation = useCallback(async (contact) => {
    setSelected(contact);
    setLoadingMsgs(true);
    setErr("");
    try {
      const data = await fetchConversation(contact.userId);
      setMessages(data.messages || []);
      // Refresh contacts to update unread badge
      loadContacts();
    } catch {
      setErr("Could not load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }, [loadContacts]);

  // ── Start new conversation via picker ────────────────────────────────────
  const startNewChat = (targetUser) => {
    const contact = {
      userId:  targetUser._id,
      name:    targetUser.exhibitorProfile?.company || targetUser.name,
      role:    targetUser.role,
      convId:  null,
    };
    setShowPicker(false);
    setContacts((prev) => {
      const exists = prev.some((c) => c.userId.toString() === targetUser._id.toString());
      if (exists) return prev;
      return [contact, ...prev];
    });
    openConversation(contact);
  };

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setInput("");
    setErr("");

    // Optimistic update
    const optimistic = { id: `opt_${Date.now()}`, text, mine: true, time: "Just now" };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await sendMessageTo(selected.userId, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...res.data, mine: true } : m))
      );
      // Refresh contact list so last-message preview updates
      loadContacts();
    } catch (e) {
      setErr(e.message || "Failed to send.");
      // Roll back optimistic
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const totalUnread = contacts.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: G.accent, marginBottom: 4 }}>
            Communication
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-.02em", marginBottom: 4 }}>
            Messages
            {totalUnread > 0 && (
              <span style={{ marginLeft: 10, fontSize: 11, background: ACCENT, color: "#fff", borderRadius: 10, padding: "2px 8px", verticalAlign: "middle" }}>
                {totalUnread} new
              </span>
            )}
          </h2>
          <p style={{ fontSize: 13, color: G.muted }}>Communicate with admin and fellow exhibitors.</p>
        </div>
        <button
          onClick={() => setShowPicker((p) => !p)}
          style={{
            background: ACCENT, color: "#fff", border: "none", borderRadius: 8,
            padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0,
          }}
        >
          ✉ New Chat
        </button>
      </div>

      {/* ── New Chat Picker ── */}
      {showPicker && (
        <Card style={{ marginBottom: 14, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
            Start a conversation with…
          </div>
          {allUsers.length === 0 ? (
            <div style={{ fontSize: 12, color: G.muted }}>No users found.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allUsers.map((u) => (
                <button
                  key={u._id}
                  onClick={() => startNewChat(u)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: G.card2, border: `1px solid ${G.border}`,
                    borderRadius: 8, padding: "7px 12px", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: G.text,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = G.border)}
                >
                  <Avatar name={u.exhibitorProfile?.company || u.name} size={26} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700 }}>{u.exhibitorProfile?.company || u.name}</div>
                    <div style={{ fontSize: 10, color: G.muted }}>{roleLabel(u.role)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {err && (
        <div style={{ background: "rgba(239,68,68,.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,.2)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* ── Main Chat Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, height: 500 }}>
        {/* ── Contacts Panel ── */}
        <Card style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${G.border}`, fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .5 }}>
            Contacts
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingCtx ? (
              <Spinner />
            ) : contacts.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, color: G.muted }}>No conversations yet.</div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => openConversation(c)}
                  style={{
                    width: "100%", padding: "12px 14px", border: "none",
                    borderLeft: selected?.userId === c.userId ? `3px solid ${ACCENT}` : "3px solid transparent",
                    background: selected?.userId === c.userId ? `${ACCENT}10` : "transparent",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", textAlign: "left",
                    borderBottom: `1px solid ${G.border}`, transition: "all .15s",
                  }}
                >
                  <Avatar name={c.name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: G.text, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{c.name}</span>
                      {c.unreadCount > 0 && (
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: G.muted, marginTop: 1 }}>{roleLabel(c.role)}</div>
                    {c.lastMsg && (
                      <div style={{ fontSize: 10, color: G.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.lastMsg.slice(0, 30)}{c.lastMsg.length > 30 ? "…" : ""}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* ── Thread Panel ── */}
        <Card style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: G.muted }}>
              <div style={{ fontSize: 36, opacity: .4 }}>💬</div>
              <div style={{ fontSize: 13 }}>Select a contact or start a new chat.</div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={selected.name} size={36} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: G.text, fontFamily: "'Syne',sans-serif" }}>{selected.name}</div>
                  <div style={{ fontSize: 11, color: G.muted }}>{roleLabel(selected.role)}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                {loadingMsgs ? (
                  <Spinner />
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: G.muted, fontSize: 13, marginTop: 40 }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "70%", padding: "10px 14px",
                        borderRadius: m.mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        background: m.mine ? ACCENT : G.card2,
                        color: m.mine ? "#fff" : G.text,
                        fontSize: 13, lineHeight: 1.55,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 10, marginTop: 4, opacity: .65, textAlign: m.mine ? "right" : "left" }}>
                          {m.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${G.border}`, display: "flex", gap: 10 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message… (Enter to send)"
                  disabled={sending}
                  style={{ borderRadius: 20, flex: 1 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  style={{
                    background: input.trim() && !sending ? ACCENT : "rgba(255,255,255,.06)",
                    border: "none", borderRadius: 20,
                    color: input.trim() && !sending ? "#fff" : G.muted,
                    padding: "9px 20px", cursor: input.trim() && !sending ? "pointer" : "default",
                    fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0,
                    transition: "all .15s",
                  }}
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
