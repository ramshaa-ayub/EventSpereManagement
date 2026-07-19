import { useState } from "react";
import { adminCss, G } from "./shared.jsx";

import Sidebar          from "./Sidebar.jsx";
import ExpoManagement   from "./ExpoManagement.jsx";
import ApplicationsPage from "./ApplicationsPage.jsx";
import SessionsPage     from "./SessionsPage.jsx";
import FloorPlan        from "./FloorPlan.jsx";
import Analytics        from "./Analytics.jsx";
import Messages         from "./Messages.jsx";
import Footer           from "../Components/Footer.jsx";

export default function AdminDashboard({ user, onLogout }) {
  const [active,       setActive]       = useState("analytics");
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: adminCss }} />
      <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <Sidebar
          active={active}
          setActive={setActive}
          user={user || { name: "Admin", role: "admin" }}
          onLogout={onLogout || (() => {})}
          pendingCount={pendingCount}
        />
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
          {active === "expos"        && <ExpoManagement />}
          {active === "applications" && <ApplicationsPage onPendingChange={setPendingCount} />}
          {active === "sessions"     && <SessionsPage />}
          {active === "floorplan"    && <FloorPlan />}
          {active === "analytics"    && <Analytics onNavigate={setActive} />}
          {active === "messages"     && (
            <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
              <Messages />
            </div>
          )}
          </div>
          <Footer theme={G} portalName="Admin" />
        </div>
      </div>
    </>
  );
}
