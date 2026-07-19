import { useState } from "react";
import { G, ACCENT, Btn, EmptyState } from "./shared.jsx";

export default function ExploreExpos({ expos, loading, onApply }) {
  const [search, setSearch] = useState("");
  const filtered = expos.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date(); today.setHours(0,0,0,0);
  const withStatus = filtered.map(e => {
    const d = e.date ? new Date(e.date) : null;
    return { ...e, status: (d && d < today) ? "completed" : e.status };
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: G.accent, marginBottom: 5 }}>Discover</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: "-.02em", marginBottom: 4, lineHeight: 1.1 }}>
              Explore <span style={{ color: G.accent }}>Expos</span>
            </h2>
            <p style={{ fontSize: 13, color: G.muted }}>Find upcoming exhibitions and apply for a booth.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ padding: "5px 14px", borderRadius: 20, background: `${G.accent}12`, border: `1px solid ${G.accent}30`, fontSize: 11, color: G.accent, fontWeight: 700 }}>
              {withStatus.filter(e => e.status === "upcoming").length} Open
            </div>
            <div style={{ padding: "5px 14px", borderRadius: 20, background: "rgba(100,100,130,.1)", border: `1px solid ${G.border}`, fontSize: 11, color: G.muted }}>
              {withStatus.filter(e => e.status === "completed").length} Closed
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 22 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</div>
        <input
          type="text"
          placeholder="Search by title or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
            background: G.card2, border: `1px solid ${G.border}`, borderRadius: 10,
            color: G.text, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
            outline: "none", boxSizing: "border-box", transition: "border-color .2s",
          }}
          onFocus={e => e.target.style.borderColor = `${G.accent}60`}
          onBlur={e => e.target.style.borderColor = G.border}
        />
      </div>

      {loading ? (
        <EmptyState icon="⏳" text="Loading expos from server..." />
      ) : withStatus.length === 0 ? (
        <EmptyState icon="🔍" text="No expos found. Try a different search." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {withStatus.map(expo => {
            const isUpcoming  = expo.status === "upcoming";
            const isCompleted = expo.status === "completed";
            const statusColor = isUpcoming ? G.accent : isCompleted ? G.green : G.muted;
            const statusLabel = isUpcoming ? "● Open for Applications" : isCompleted ? "✓ Completed" : `○ ${expo.status}`;

            return (
              <div key={expo._id} style={{
                background: G.card, border: `1px solid ${G.border}`, borderRadius: 16,
                overflow: "hidden", transition: "transform .22s, border-color .22s, box-shadow .22s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = `${G.accent}45`; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Image */}
                <div style={{ height: 170, position: "relative", overflow: "hidden", background: "#0e0e1a" }}>
                  {expo.img ? (
                    <img src={expo.img} alt={expo.title}
                      onError={e => e.target.style.display = "none"}
                      style={{ width: "100%", height: "100%", objectFit: "cover",
                        filter: isCompleted ? "grayscale(50%) brightness(.7)" : "brightness(.85)",
                        transition: "transform .45s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: `linear-gradient(135deg,${G.accent}18,${G.card2})` }}>
                      <span style={{ fontSize: 44, opacity: 0.22 }}>🏢</span>
                    </div>
                  )}
                  {/* Gradient */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(7,7,15,.9) 100%)" }} />

                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    padding: "3px 10px", borderRadius: 50, fontSize: 9, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: ".07em",
                    background: `${statusColor}20`, color: statusColor,
                    border: `1px solid ${statusColor}35`, backdropFilter: "blur(6px)",
                  }}>
                    {statusLabel}
                  </div>

                  {/* Theme tag */}
                  {expo.theme && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "3px 9px", borderRadius: 50, fontSize: 9, fontWeight: 600,
                      background: "rgba(0,0,0,.45)", color: "rgba(255,255,255,.7)", backdropFilter: "blur(6px)",
                    }}>
                      {expo.theme}
                    </div>
                  )}

                  {/* Title overlay */}
                  <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,.7)" }}>
                      {expo.title}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "14px 16px 16px" }}>
                  {/* Meta */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 8px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: G.muted }}>
                      <span>📅</span><span>{expo.date || "TBA"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: G.muted, overflow: "hidden" }}>
                      <span>📍</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{expo.location || "TBA"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: G.muted }}>
                      <span>🏪</span><span>{expo.booths || 0} booths available</span>
                    </div>
                  </div>

                  {expo.description && (
                    <p style={{ fontSize: 11, color: G.muted, marginBottom: 14, lineHeight: 1.55,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {expo.description}
                    </p>
                  )}

                  {/* Divider */}
                  <div style={{ height: 1, background: G.border, marginBottom: 12 }} />

                  {/* CTA */}
                  {isUpcoming ? (
                    <Btn size="sm" onClick={() => onApply(expo)} style={{ width: "100%", justifyContent: "center" }}>
                      🚀 Apply for Booth
                    </Btn>
                  ) : (
                    <div style={{ textAlign: "center", fontSize: 11, color: G.muted, fontStyle: "italic", padding: "6px 0" }}>
                      Applications closed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
