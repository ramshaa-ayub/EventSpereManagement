import { useState, useEffect } from "react";
import {
  fetchExpos,
  fetchMyApplications,
} from "../api.js";

import Sidebar         from "./Sidebar.jsx";
import Dashboard       from "./Dashboard.jsx";
import ExploreExpos    from "./ExploreExpos.jsx";
import MyApplication   from "./MyApplication.jsx";
import BoothManager    from "./BoothManager.jsx";
import MessagesSection from "./Messages.jsx";
import Profile         from "./Profile.jsx";
import Footer          from "../Components/Footer.jsx";

import { G, exhCss } from "./shared.jsx";

export default function ExhibitorPortal({ user: propUser, onLogout, onUpdateUser }) {
  const [user,    setUser]    = useState(propUser || { id: "dev", name: "Demo Exhibitor", email: "exhibitor@demo.com", role: "exhibitor" });
  const [active,  setActive]  = useState("dashboard");

  const [expos,    setExpos]    = useState([]);
  const [apps,     setApps]     = useState([]);
  const [unread,   setUnread]   = useState(0);

  const [expoLoading, setExpoLoading] = useState(false);
  const [appLoading,  setAppLoading]  = useState(false);

  const [preselectedExpo, setPreselectedExpo] = useState(null);

  const approvedApp = apps.find(a => a.status === "approved");

  const loadData = async () => {
    setExpoLoading(true); setAppLoading(true);
    try {
      const exposData = await fetchExpos();
      const today = new Date(); today.setHours(0,0,0,0);
      setExpos(exposData.map(e => {
        const d = e.date ? new Date(e.date) : null;
        return { ...e, status: (d && d < today) ? 'completed' : e.status };
      }));
    } catch { } finally { setExpoLoading(false); }
    try { setApps(await fetchMyApplications()); } catch { } finally { setAppLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleApply = (expo) => {
    setPreselectedExpo(expo);
    setActive("application");
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: exhCss }} />
      <div className="layout-container" style={{ display: "flex", minHeight: "100vh", background: G.bg, color: G.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <Sidebar
          active={active}
          setActive={setActive}
          user={user}
          unread={unread}
          onLogout={onLogout || (() => {})}
        />
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "28px 32px", maxWidth: 1100, flex: 1 }}>
            {active === "dashboard"   && <Dashboard     user={user} apps={apps} expos={expos} booth={approvedApp} onNavigate={setActive} />}
            {active === "explore"     && <ExploreExpos  expos={expos} loading={expoLoading} onApply={handleApply} />}
            {active === "application" && <MyApplication apps={apps} expos={expos} loading={appLoading} refresh={loadData} preselectedExpo={preselectedExpo} onClearPreselect={() => setPreselectedExpo(null)} />}
            {active === "booth"       && <BoothManager  apps={apps} expos={expos} />}
            {active === "messages"    && <MessagesSection user={user} />}
            {active === "profile"     && <Profile       user={user} onUpdate={handleUpdateUser} />}
          </div>
          <Footer theme={G} portalName="Exhibitor" />
        </div>
      </div>
    </>
  );
}
