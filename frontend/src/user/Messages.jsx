import React, { useState, useRef, useEffect, useCallback } from "react";
import { G } from "@utils/theme.js";
import Card from "@components/Card.jsx";
import {
  fetchMessageContacts,
  fetchExhibitorContacts,
  fetchConversation,
  sendMessageTo,
} from "../api.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const Avatar = ({ name = "?", size = 36, accent }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `${accent || G.accent}20`, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: size * 0.39, fontWeight: 700,
    color: accent || G.accent, flexShrink: 0, textTransform: "uppercase",
  }}>
    {(name[0] || "?")}
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      border: `2px solid ${G.accent}`, borderTopColor: "transparent",
      animation: "attSpin .7s linear infinite",
    }} />
    <style>{`@keyframes attSpin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function Messages({ user }) {
  const [contacts,     setContacts]     = useState([]);
  const [exhibitors,   setExhibitors]   = useState([]); // all exhibitors for picker
  const [selected,     setSelected]     = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loadingCtx,   setLoadingCtx]   = useState(!!user);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [sending,      setSending]      = useState(false);
  const [err,          setErr]          = useState("");
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const bottomRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Load contacts ────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    if (!user) return;
    setLoadingCtx(true);
    try {
      const data = await fetchMessageContacts();
      setContacts(data.contacts || []);
    } catch {
      setErr("Could not load contacts.");
    } finally {
      setLoadingCtx(false);
    }
  }, [user]);

  // ── Load exhibitor list for picker ───────────────────────────────────────
  const loadExhibitors = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchExhibitorContacts();
      setExhibitors(data.exhibitors || []);
    } catch {
      // silently ignore
    }
  }, [user]);

  useEffect(() => {
    loadContacts();
    loadExhibitors();
  }, [loadContacts, loadExhibitors]);


  // ── Open conversation ────────────────────────────────────────────────────
  const openConversation = useCallback(async (contact) => {
    setSelected(contact);
    setLoadingMsgs(true);
    setErr("");
    try {
      const data = await fetchConversation(contact.userId);
      setMessages(data.messages || []);
      loadContacts();
    } catch {
      setErr("Could not load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }, [loadContacts]);

  // ── Start new chat from exhibitor picker ─────────────────────────────────
  const startNewChat = (ex) => {
    const contact = {
      userId:      ex.userId,
      name:        ex.name,
      role:        "exhibitor",
      unreadCount: 0,
    };
    setShowPicker(false);
    setPickerSearch("");
    setContacts((prev) => {
      const exists = prev.some((c) => c.userId.toString() === ex.userId.toString());
      if (exists) return prev;
      return [contact, ...prev];
    });
    openConversation(contact);
  };

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
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

  const filteredExhibitors = exhibitors.filter((ex) =>
    pickerSearch === "" ||
    ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    (ex.category || "").toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const totalUnread = contacts.reduce((s, c) => s + (c.unreadCount || 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────
  // Guard: attendees must be logged in to use messaging
  if (!user) {
    return (
      <div className="view" style={{ padding: "28px 32px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: G.accent, marginBottom: 6 }}>Inbox</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, letterSpacing: "-.02em", color: G.text, marginBottom: 20 }}>
          Your <span style={{ color: G.accent }}>Messages</span>
        </h2>
        <div style={{
          background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
          padding: "48px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14, opacity: .4 }}>🔑</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: G.text, marginBottom: 8 }}>Login required</div>
          <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
            Please log in as an attendee to send and receive messages from exhibitors.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view" style={{ padding: "28px 32px" }}>

      {/* Header */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: G.accent, marginBottom: 6 }}>Inbox</div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, letterSpacing: "-.02em", color: G.text }}>
          Your{" "}
          <span style={{ color: G.accent }}>Messages</span>
          {totalUnread > 0 && (
            <span style={{ marginLeft: 10, fontSize: 12, background: G.accent, color: "#fff", borderRadius: 10, padding: "2px 10px", verticalAlign: "middle" }}>
              {totalUnread} new
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowPicker((p) => !p)}
          style={{
            background: G.accent, color: "#fff", border: "none", borderRadius: 10,
            padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: `0 2px 12px ${G.accent}40`, transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.target.style.opacity = ".85"; e.target.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
        >
          💬 Message an Exhibitor
        </button>
      </div>

      {/* Exhibitor Picker */}
      {showPicker && (
        <Card style={{ marginBottom: 16, padding: 16, overflow: "visible" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
            Choose an exhibitor to contact
          </div>
          <input
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Search exhibitors…"
            style={{
              width: "100%", padding: "9px 14px", borderRadius: 8,
              border: `1px solid ${G.border}`, background: G.card2, color: G.text,
              fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif",
              outline: "none", marginBottom: 10, boxSizing: "border-box",
            }}
          />
          {filteredExhibitors.length === 0 ? (
            <div style={{ fontSize: 12, color: G.muted }}>No exhibitors found.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 200, overflowY: "auto" }}>
              {filteredExhibitors.map((ex) => (
                <button
                  key={ex.userId}
                  onClick={() => startNewChat(ex)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: G.card2, border: `1px solid ${G.border}`,
                    borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                    fontSize: 12, color: G.text, fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = G.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = G.border)}
                >
                  {ex.logo ? (
                    <img src={ex.logo} alt={ex.name} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <Avatar name={ex.name} size={26} accent={G.accent} />
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700 }}>{ex.name}</div>
                    <div style={{ fontSize: 10, color: G.muted }}>{ex.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {err && (
        <div style={{ background: "rgba(239,68,68,.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,.2)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* ── Main Chat Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14, height: 480 }}>
        {/* Contacts */}
        <Card style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${G.border}`, fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: .5 }}>
            Contacts
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingCtx ? (
              <Spinner />
            ) : contacts.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, color: G.muted }}>
                No conversations yet. Click "Message an Exhibitor" to start!
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.userId}
                  onClick={() => openConversation(c)}
                  style={{
                    padding: "12px 14px", cursor: "pointer",
                    background: selected?.userId === c.userId ? `${G.accent}08` : "transparent",
                    borderLeft: selected?.userId === c.userId ? `3px solid ${G.accent}` : "3px solid transparent",
                    borderBottom: `1px solid ${G.border}`, transition: "all .15s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <Avatar name={c.name} size={34} accent={G.accent} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: G.text, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{c.name}</span>
                      {c.unreadCount > 0 && (
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: G.accent, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: G.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.lastMsg ? c.lastMsg.slice(0, 28) + (c.lastMsg.length > 28 ? "…" : "") : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat window */}
        <Card style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: G.muted }}>
              <div style={{ fontSize: 40, opacity: .35 }}>💬</div>
              <div style={{ fontSize: 13 }}>Select a contact or message an exhibitor.</div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={selected.name} size={36} accent={G.accent} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: G.text, fontFamily: "'Syne',sans-serif" }}>{selected.name}</div>
                  <div style={{ fontSize: 10, color: G.teal, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: G.teal, display: "inline-block" }} />
                    {selected.role === "admin" ? "Administrator" : "Exhibitor"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
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
                        background: m.mine ? G.accent : G.card2,
                        color: m.mine ? "#fff" : G.text, fontSize: 13, lineHeight: 1.55,
                      }}>
                        {m.text}
                        <div style={{ fontSize: 10, marginTop: 4, opacity: .6, textAlign: m.mine ? "right" : "left" }}>
                          {m.time}
                        </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  disabled={sending}
                  style={{
                    flex: 1, background: G.card2, border: `1px solid ${G.border}`, borderRadius: 20,
                    padding: "9px 16px", color: G.text, fontSize: 13, outline: "none",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  style={{
                    background: input.trim() && !sending ? G.accent : "rgba(255,255,255,.05)",
                    color: input.trim() && !sending ? "#fff" : G.muted,
                    border: "none", borderRadius: 20,
                    padding: "9px 22px", cursor: input.trim() && !sending ? "pointer" : "default",
                    fontSize: 12, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0,
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