import { useState, useEffect } from "react";
import { G, ACCENT, Card, Btn, Input, SectionTitle, EmptyState } from "./shared.jsx";
import { fetchBooths, updateBooth } from "../api.js";

export default function BoothManager({ apps, expos = [] }) {
  const approved = apps.find(a => a.status === "approved");
  const boothIdStr = approved ? `${approved.expo}-${approved.booth}` : null;

  const [boothData, setBoothData] = useState(null);
  const [products,   setProducts]   = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", desc: "" });
  const [showAdd,    setShowAdd]    = useState(false);
  const [boothNote,  setBoothNote]  = useState("");
  const [saved,      setSaved]      = useState(false);
  const [loading,    setLoading]    = useState(!!approved);

  useEffect(() => {
    if (boothIdStr) {
      setLoading(true);
      fetchBooths().then(booths => {
        const myBooth = booths.find(b => b.id === boothIdStr);
        if (myBooth) {
          setBoothData(myBooth);
          setProducts(myBooth.products || []);
          setBoothNote(myBooth.notes || "");
        }
      }).catch(e => console.error(e)).finally(() => setLoading(false));
    }
  }, [boothIdStr]);

  const saveBoothData = async (newProducts, newNote) => {
    if (!boothIdStr) return;
    try {
      await updateBooth(boothIdStr, { products: newProducts, notes: newNote });
    } catch (e) {
      console.error("Failed to save booth data", e);
    }
  };

  const addProduct = async () => { 
    if (!newProduct.name) return; 
    const updated = [...products, { ...newProduct, id: Date.now() }];
    setProducts(updated);
    setNewProduct({ name: "", price: "", desc: "" }); 
    setShowAdd(false); 
    await saveBoothData(updated, boothNote);
  };
  
  const removeProduct = async (id) => {
    const updated = products.filter(x => x.id !== id);
    setProducts(updated);
    await saveBoothData(updated, boothNote);
  };
  
  const saveNote = async () => { 
    await saveBoothData(products, boothNote);
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };

  if (!approved) return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Venue</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em' }}>Booth Manager</h2>
      </div>
      <Card style={{ padding: 32 }}>
        <EmptyState icon="🏪" text="No approved booth yet. Apply and get approved to access Booth Manager." />
      </Card>
    </div>
  );

  if (loading) return <div style={{ color: G.muted }}>Loading booth details...</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: G.accent, marginBottom: 4 }}>Venue</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.text, fontFamily: "'Syne',sans-serif", letterSpacing: '-.02em', marginBottom: 4 }}>Booth Manager</h2>
        <p style={{ fontSize: 13, color: G.muted }}>Manage your booth details and product showcase.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>
        {/* Left column */}
        <div>
          <Card style={{ padding: 22, marginBottom: 14 }}>
            <SectionTitle>Booth Details</SectionTitle>
            <div style={{
              width: "100%", aspectRatio: "16/7", borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT}06)`,
              border: `2px dashed ${ACCENT}44`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>🏪</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: ACCENT, fontFamily: "'Syne',sans-serif" }}>
                Booth {approved.booth}
              </div>
              <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                {(() => {
                  const obj = expos.find(e => e._id === approved.expo) || expos.find(e => e.title === approved.expo);
                  return obj ? obj.title : approved.expo;
                })()}
              </div>
            </div>
            {[
              ["Company", approved.company], 
              ["Booth ID", approved.booth], 
              ["Expo", (() => {
                const obj = expos.find(e => e._id === approved.expo) || expos.find(e => e.title === approved.expo);
                return obj ? obj.title : approved.expo;
              })()], 
              ["Status", "Approved ✓"]
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 12, color: G.muted }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: G.text }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 22 }}>
            <SectionTitle>Booth Notes</SectionTitle>
            <textarea value={boothNote} onChange={e => setBoothNote(e.target.value)} rows={3}
              style={{ resize: "vertical" }} />
            <Btn size="sm" onClick={saveNote} style={{ marginTop: 10 }}>
              {saved ? "✅ Saved!" : "💾 Save Notes"}
            </Btn>
          </Card>
        </div>

        {/* Products */}
        <Card style={{ padding: 22 }}>
          <SectionTitle>
            Products / Services
            <Btn size="sm" onClick={() => setShowAdd(!showAdd)}>＋ Add Product</Btn>
          </SectionTitle>
          {showAdd && (
            <div style={{ background: G.card2, borderRadius: 10, padding: 16, marginBottom: 14, border: `1px solid ${G.border}` }}>
              <div style={{ display: "grid", gap: 10 }}>
                <Input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Price (e.g. $99/mo)" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                <Input placeholder="Short description" value={newProduct.desc} onChange={e => setNewProduct(p => ({ ...p, desc: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn size="sm" onClick={addProduct}>✓ Add</Btn>
                  <Btn size="sm" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
                </div>
              </div>
            </div>
          )}
          {products.length === 0 ? (
            <EmptyState icon="📦" text="No products added yet." />
          ) : products.map(p => (
            <div key={p.id} style={{
              padding: "14px 16px", background: G.card2, borderRadius: 10,
              border: `1px solid ${G.border}`, marginBottom: 10,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: G.text }}>{p.name}</div>
                {p.desc  && <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{p.desc}</div>}
                {p.price && <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginTop: 4 }}>{p.price}</div>}
              </div>
              <button onClick={() => removeProduct(p.id)}
                style={{ background: 'rgba(239,68,68,.1)', color: '#EF4444', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Remove
              </button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
