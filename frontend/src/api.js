// ─────────────────────────────────────────────────────────────────────────────
// api.js  —  All API helpers with unified auth support
// ─────────────────────────────────────────────────────────────────────────────
const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;
export const API_BASE = BASE;

// ── Unified Auth Store ────────────────────────────────────────────────────────
const TOKEN_KEY = "eventsphere_token";
const USER_KEY  = "eventsphere_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const updateStoredUser = (user) => {
  const token = getToken();
  if (token) saveAuth(token, user);
};

const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const apiLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Also clear legacy exhibitor keys
  localStorage.removeItem("exhibitor_token");
  localStorage.removeItem("exhibitor_user");
};

// ── Headers (auto-attach token when available) ────────────────────────────────
const headers = () => {
  const token = getToken();
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

// ── Auth API ──────────────────────────────────────────────────────────────────
export const apiLogin = async (email, password, role) => {
  const res  = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  // Verify that the returned role matches what user selected
  if (role && json.user.role !== role) {
    throw new Error(`This account is not registered as ${role}`);
  }
  saveAuth(json.token, json.user);
  return json;
};

export const apiRegister = async (name, email, password, role = "attendee") => {
  const res  = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  saveAuth(json.token, json.user);
  return json;
};

// ── EXPOS ─────────────────────────────────────────────────────
export const fetchExpos = async () => {
  const res = await fetch(`${BASE}/expos`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch expos");
  return res.json();
};

export const fetchExpoStats = async () => {
  const expos    = await fetchExpos();
  const total    = expos.length;
  const upcoming = expos.filter(e => e.status === "upcoming").length;
  const ongoing  = expos.filter(e => e.status === "ongoing").length;
  const completed= expos.filter(e => e.status === "completed").length;
  return { total, upcoming, ongoing, completed };
};

export const createExpo = async (data) => {
  const res  = await fetch(`${BASE}/expos`, {
    method: "POST", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const updateExpo = async (id, data) => {
  const res  = await fetch(`${BASE}/expos/${id}`, {
    method: "PUT", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const deleteExpo = async (id) => {
  const res  = await fetch(`${BASE}/expos/${id}`, {
    method: "DELETE", headers: headers(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// ── APPLICATIONS ──────────────────────────────────────────────
export const fetchApplications = async (status = "") => {
  const url = status ? `${BASE}/applications?status=${status}` : `${BASE}/applications`;
  const res  = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
};

export const fetchAppStats = async () => {
  const res = await fetch(`${BASE}/applications/stats`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch application stats");
  return res.json();
};

export const reviewApplication = async (id, status, reviewNote = "") => {
  const res  = await fetch(`${BASE}/applications/${id}/review`, {
    method: "PATCH", headers: headers(), body: JSON.stringify({ status, reviewNote }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const deleteApplication = async (id) => {
  const res  = await fetch(`${BASE}/applications/${id}`, {
    method: "DELETE", headers: headers(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const fetchMyApplications = async () => {
  const res = await fetch(`${BASE}/applications/mine`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch your applications");
  return res.json();
};

export const submitMyApplication = async (data) => {
  const res  = await fetch(`${BASE}/applications`, {
    method: "POST", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// ── SESSIONS ──────────────────────────────────────────────────
export const fetchSessions = async () => {
  const res = await fetch(`${BASE}/sessions`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
};

export const createSession = async (data) => {
  const res  = await fetch(`${BASE}/sessions`, {
    method: "POST", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const updateSession = async (id, data) => {
  const res  = await fetch(`${BASE}/sessions/${id}`, {
    method: "PUT", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const deleteSession = async (id) => {
  const res  = await fetch(`${BASE}/sessions/${id}`, {
    method: "DELETE", headers: headers(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const registerForSession = async (sessionId, data) => {
  const res  = await fetch(`${BASE}/sessions/${sessionId}/register`, {
    method: "POST", headers: headers(), body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const fetchMyRegistrations = async () => {
  const res = await fetch(`${BASE}/sessions/my-registrations`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch registrations");
  return res.json();
};

export const fetchSessionRegistrations = async (sessionId) => {
  const res = await fetch(`${BASE}/sessions/${sessionId}/registrations`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch registrations");
  return res.json();
};

// ── USERS ─────────────────────────────────────────────────────
export const fetchUsers = async () => {
  const res = await fetch(`${BASE}/users`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const fetchUserStats = async () => {
  const res = await fetch(`${BASE}/users/stats`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch user stats");
  return res.json();
};

export const deleteUserById = async (id) => {
  const res  = await fetch(`${BASE}/users/${id}`, {
    method: "DELETE", headers: headers(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// ── ANALYTICS ─────────────────────────────────────────────────
export const fetchAnalytics = async () => {
  const res = await fetch(`${BASE}/analytics`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};

// ── FEEDBACK ──────────────────────────────────────────────────
export const fetchFeedback = async () => {
  const res = await fetch(`${BASE}/feedback`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch feedback");
  const json = await res.json();
  // API returns { feedbackList: [...], total } — extract the array
  return Array.isArray(json) ? json : (json.feedbackList || json.feedback || []);
};

export const updateFeedbackStatus = async (id, status) => {
  const res  = await fetch(`${BASE}/feedback/${id}/status`, {
    method: "PATCH", headers: headers(), body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// ── MESSAGES ──────────────────────────────────────────────────

/** My contacts (people I've chatted with + admin default) */
export const fetchMessageContacts = async () => {
  const res = await fetch(`${BASE}/messages/contacts`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json(); // { contacts: [...] }
};

/** All registered exhibitors — for attendee "new conversation" picker */
export const fetchExhibitorContacts = async () => {
  const res = await fetch(`${BASE}/messages/exhibitors`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch exhibitors");
  return res.json(); // { exhibitors: [...] }
};

/** Admin: everyone who has messaged admin */
export const fetchAllMessageContacts = async () => {
  const res = await fetch(`${BASE}/messages/all-contacts`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json(); // { contacts: [...] }
};

/** Conversation thread with a specific user */
export const fetchConversation = async (otherId) => {
  const res = await fetch(`${BASE}/messages/conversation/${otherId}`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json(); // { messages: [...] }
};

/** Send a message to a specific user */
export const sendMessageTo = async (receiverId, text) => {
  const res  = await fetch(`${BASE}/messages/send`, {
    method: "POST", headers: headers(), body: JSON.stringify({ receiverId, text }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json; // { data: { id, text, mine, time } }
};

/** Unread count for current user */
export const fetchUnreadCount = async () => {
  const res = await fetch(`${BASE}/messages/unread-count`, { headers: headers() });
  if (!res.ok) return { count: 0 };
  return res.json(); // { count }
};

/** Mark all messages to me as read */
export const markAllMessagesRead = async () => {
  const res = await fetch(`${BASE}/messages/read-all`, {
    method: "PATCH", headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
};

// Legacy alias kept for any remaining references
export const fetchInbox = fetchMessageContacts;
export const sendMessage = (data) => sendMessageTo(data.receiverId, data.text);

// ── BOOTHS ────────────────────────────────────────────────────
export const fetchBooths = async () => {
  const res = await fetch(`${BASE}/booths`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch booths");
  return res.json();
};

export const updateBooth = async (id, data) => {
  const res = await fetch(`${BASE}/booths/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

// ── Legacy aliases (keep backward compat) ─────────────────────
export const fetchPublicExpos = fetchExpos;
export const getStoredExhibitor = getStoredUser;
export const apiExhibitorLogin = (email, password) => apiLogin(email, password, "exhibitor");
export const apiExhibitorRegister = (name, email, password) => apiRegister(name, email, password, "exhibitor");
export const apiExhibitorLogout = apiLogout;