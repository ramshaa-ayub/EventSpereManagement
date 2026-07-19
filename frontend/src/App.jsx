import { useState, useEffect } from "react";
import { getStoredUser, apiLogout, updateStoredUser } from "./api.js";
import LoginPage       from "./LoginPage.jsx";
import AdminDashboard  from "./admin/AdminDashboard.jsx";
import ExhibitorPortal from "./exhibitor/ExhibitorPortal.jsx";
import AttendeePortal  from "./user/UserLayout.jsx";

// ── Auth Router ───────────────────────────────────────────────────────────────
//
//  Flow:
//    • On load   → read localStorage for saved user
//    • No user   → show AttendeePortal (public, read-only) + "Login" button in nav
//    • user.role = "admin"     → AdminDashboard
//    • user.role = "exhibitor" → ExhibitorPortal
//    • user.role = "attendee"  → AttendeePortal (personalised)
//    • showLogin = true        → LoginPage overlay
//
export default function App() {
  const [user,      setUser]      = useState(() => getStoredUser()); // hydrate from localStorage
  const [showLogin, setShowLogin] = useState(false);
  const [resetTokenFromUrl, setResetTokenFromUrl] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/reset-password/")) {
      const token = path.split("/")[2];
      if (token) {
        setResetTokenFromUrl(token);
        setShowLogin(true);
      }
    }
  }, []);

  // Handle login callback from LoginPage
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);   // null → guest attendee
    setShowLogin(false);
  };

  // Handle logout — clear store and return to public attendee view
  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setShowLogin(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    updateStoredUser(updatedUser);
  };

  // If user has a role, skip the login page and show correct portal
  if (showLogin) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        initialScreen={resetTokenFromUrl ? "reset" : "login"}
        initialResetToken={resetTokenFromUrl || ""}
      />
    );
  }

  // Admin portal (only for authenticated admins)
  if (user?.role === "admin") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Exhibitor portal (only for authenticated exhibitors)
  if (user?.role === "exhibitor") {
    return (
      <ExhibitorPortal
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  // Attendee portal — default for guests AND logged-in attendees
  return (
    <AttendeePortal
      user={user}                         // null = guest
      onLoginClick={() => setShowLogin(true)}
      onLogout={handleLogout}
    />
  );
}
