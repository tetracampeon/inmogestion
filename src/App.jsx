import { useState, useMemo, useEffect, useCallback } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const SUPABASE_URL = "https://nzssegioltvgciiwphic.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56c3NlZ2lvbHR2Z2NpaXdwaGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODIwMTUsImV4cCI6MjA4ODY1ODAxNX0.g2F0FEFC4ShsBol1QBSmwD58-MyDCIQb6zpDKMf1sx8";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────
const sb = {
  h: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
  async get(table, params = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: this.h });
    if (!r.ok) return [];
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: this.h, body: JSON.stringify(body) });
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: this.h, body: JSON.stringify(body) });
    return r.json();
  },
  async del(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: this.h });
  },
  async upsert(table, body, onConflict) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: "POST",
      headers: { ...this.h, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body)
    });
    return r.json();
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────
const hoy = new Date();

function diasHasta(fechaStr) {
  if (!fechaStr) return 999;
  return Math.round((new Date(fechaStr) - hoy) / (1000 * 60 * 60 * 24));
}

function urgenciaColor(fechaStr) {
  const d = diasHasta(fechaStr);
  if (d < 0)   return { bg: "#ff3b3b22", border: "#ff3b3b", text: "#ff3b3b" };
  if (d <= 30)  return { bg: "#ff6b0022", border: "#ff6b00", text: "#ff6b00" };
  if (d <= 90)  return { bg: "#f5c84222", border: "#f5c842", text: "#c9a200" };
  return         { bg: "#00c27322", border: "#00c273", text: "#00a862" };
}

function mesLabel(mes) {
  if (!mes) return "";
  const [y, m] = mes.split("-");
  return ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][parseInt(m)-1] + " " + y.slice(2);
}

function getMesesRecientes(n = 4) {
  const meses = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    meses.push(`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}`);
  }
  return meses;
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────
const inputStyle = {
  background: "#0e1117", border: "1px solid #2a2f3d", borderRadius: 8,
  color: "#e8dfc8", padding: "9px 12px", fontSize: 13, fontFamily: "DM Sans",
  width: "100%", outline: "none", boxSizing: "border-box"
};
const labelStyle = {
  fontSize: 11, color: "#888", fontFamily: "DM Sans", display: "block",
  marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase"
};
const btnPrimary = {
  background: "#c9a84c", color: "#0a0c10", border: "none", borderRadius: 8,
  padding: "10px 20px", fontFamily: "DM Sans", fontSize: 13, fontWeight: 600, cursor: "pointer"
};

// ─── ATOMS ────────────────────────────────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>
);
const Tag = ({ children, color = "#8b5cf6" }) => (
  <span style={{ background: color+"22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 500 }}>{children}</span>
);
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #2a2f3d", borderTop: "3px solid #c9a84c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
  </div>
);

function Modal({ onClose, children, title }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#141820", border: "1px solid #2a2f3d", borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: "DM Serif Display", fontSize: 22, color: "#e8dfc8" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!usuario || !password) return setError("Completá usuario y contraseña");
    setLoading(true);
    setError("");
    try {
      const data = await sb.get("usuarios", `?usuario=eq.${encodeURIComponent(usuario)}&password=eq.${encodeURIComponent(password)}&select=*`);
      if (Array.isArray(data) && data.length > 0) {
        onLogin(data[0]);
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch {
      setError("Error de conexión. Revisá internet.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans" }}>
      <style>{FONT + `* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: #444; }`}</style>
      <div style={{ width: "100%", maxWidth: 380, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 60, height: 60, background: "#c9a84c22", border: "1px solid #c9a84c44", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>🏠</div>
          <div style={{ fontFamily: "DM Serif Display", fontSize: 30, color: "#e8dfc8" }}>InmoGestión</div>
          <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>Ingresá con tu cuenta</div>
        </div>
        <div style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 16, padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Usuario</label>
            <input value={usuario} onChange={e => setUsuario(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="tu usuario" style={inputStyle} autoFocus />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inputStyle} />
          </div>
          {error && (
            <div style={{ background: "#ff3b3b11", border: "1px solid #ff3b3b33", color: "#ff3b3b", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <button onClick={handleLogin} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "13px", fontSize: 14, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Verificando..." : "Ingresar →"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: "#444", fontSize: 12 }}>
          Usuario: <span style={{ color: "#666" }}>florencia</span> · Contraseña: <span style={{ color: "#666" }}>1234</span>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [inquilinos, setInquilinos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const MESES = getMesesRecientes(4);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [inqs, props, pgs] = await Promise.all([
      sb.get("inquilinos", "?select=*&order=nombre"),
      sb.get("propiedades", "?select=*&order=direccion"),
      sb.get("pagos", "?select=*"),
    ]);
    setInquilinos(Array.isArray(inqs) ? inqs : []);
    setPropiedades(Array.isArray(props) ? props : []);
    setPagos(Array.isArray(pgs) ? pgs : []);
    setLoading(false);
  }, []);

  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  const propNombre = id => propiedades.find(p => p.id === id)?.direccion || "–";
  const pagado = (inqId, mes) => pagos.some(p => p.inquilino_id === inqId && p.mes === mes && p.pagado);

  async function togglePago(inqId, mes) {
    const actual = pagado(inqId, mes);
    await sb.upsert("pagos", { inquilino_id: inqId, mes, pagado: !actual, fecha_pago: !actual ? new Date().toISOString().split("T")[0] : null }, "inquilino_id,mes");
    const pgs = await sb.get("pagos", "?select=*");
    setPagos(Array.isArray(pgs) ? pgs : []);
  }

  async function guardarInquilino(data) {
    if (data.id) await sb.patch("inquilinos", data.id, data);
    else await sb.post("inquilinos", data);
    setModal(null);
    cargarDatos();
  }

  async function eliminarInquilino(id) {
    if (!confirm("¿Eliminar este inquilino?")) return;
    await sb.del("inquilinos", id);
    cargarDatos();
  }

  async function guardarPropiedad(data) {
    if (data.id) await sb.patch("propiedades", data.id, data);
    else await sb.post("propiedades", data);
    setModal(null);
    cargarDatos();
  }

  async function eliminarPropiedad(id) {
    if (!confirm("¿Eliminar esta propiedad?")) return;
    await sb.del("propiedades", id);
    cargarDatos();
  }

  const stats = useMemo(() => {
    const mesActual = MESES[MESES.length - 1];
    return {
      alquiladas: propiedades.filter(p => p.estado === "alquilada").length,
      enVenta: propiedades.filter(p => p.estado === "venta").length,
      disponibles: propiedades.filter(p => p.estado === "disponible").length,
      vencenProximo: inquilinos.filter(i => { const d = diasHasta(i.vencimiento); return d >= 0 && d <= 60; }).length,
      vencidos: inquilinos.filter(i => diasHasta(i.vencimiento) < 0).length,
      ingresosMes: inquilinos.filter(i => pagado(i.id, mesActual)).reduce((s, i) => s + (i.alquiler||0), 0),
      pendientesMes: inquilinos.filter(i => !pagado(i.id, mesActual)).reduce((s, i) => s + (i.alquiler||0), 0),
    };
  }, [inquilinos, propiedades, pagos]);

  if (!usuario) return <Login onLogin={setUsuario} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "inquilinos", label: "Inquilinos", icon: "◎" },
    { id: "cobranzas", label: "Cobranzas", icon: "◈" },
    { id: "propiedades", label: "Propiedades", icon: "◧" },
  ];

  return (
    <>
      <style>{FONT + `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0c10; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0e1117; }
        ::-webkit-scrollbar-thumb { background: #2a2f3d; border-radius: 3px; }
        input::placeholder { color: #444; }
        select option { background: #141820; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0c10", display: "flex", fontFamily: "DM Sans, sans-serif" }}>

        {/* SIDEBAR */}
        <div style={{ width: 220, background: "#0d0f14", borderRight: "1px solid #1a1f2b", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, minHeight: "100vh" }}>
          <div style={{ padding: "0 20px 28px" }}>
            <div style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8" }}>InmoGestión</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3, letterSpacing: 1 }}>PANEL INMOBILIARIO</div>
          </div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", background: tab === t.id ? "#1a1f2b" : "none", borderLeft: tab === t.id ? "2px solid #c9a84c" : "2px solid transparent", border: "none", borderRight: "none", color: tab === t.id ? "#e8dfc8" : "#666", fontFamily: "DM Sans", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: "pointer", width: "100%", textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #1a1f2b" }}>
            <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 600 }}>{usuario.nombre}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2, textTransform: "capitalize" }}>{usuario.rol}</div>
            <button onClick={() => setUsuario(null)} style={{ marginTop: 10, background: "none", border: "1px solid #2a2f3d", color: "#666", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "DM Sans" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {loading ? <Spinner /> : <>

            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <div>
                <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8", marginBottom: 4 }}>Resumen general</h2>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Hola, {usuario.nombre.split(" ")[0]} 👋</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 14, marginBottom: 32 }}>
                  {[
                    { label: "Alquiladas", val: stats.alquiladas, color: "#4f8ef7", icon: "🏠" },
                    { label: "En venta", val: stats.enVenta, color: "#c9a84c", icon: "🏷️" },
                    { label: "Disponibles", val: stats.disponibles, color: "#888", icon: "🔑" },
                    { label: "Vencen en 60 días", val: stats.vencenProximo, color: "#f5c842", icon: "⚠️" },
                    { label: "Contratos vencidos", val: stats.vencidos, color: "#ff3b3b", icon: "🔴" },
                    { label: "Cobrado este mes", val: `$${(stats.ingresosMes/1000).toFixed(0)}K`, color: "#00c273", icon: "💰" },
                    { label: "Pendiente este mes", val: `$${(stats.pendientesMes/1000).toFixed(0)}K`, color: "#ff6b00", icon: "📋" },
                  ].map((c, i) => (
                    <div key={i} style={{ background: "#0d0f14", border: `1px solid ${c.color}33`, borderRadius: 12, padding: "18px 16px" }}>
                      <div style={{ fontSize: 22 }}>{c.icon}</div>
                      <div style={{ fontFamily: "DM Serif Display", fontSize: 28, color: c.color, margin: "6px 0 4px" }}>{c.val}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{c.label}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8", marginBottom: 12 }}>Contratos urgentes</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {inquilinos.filter(i => diasHasta(i.vencimiento) <= 90).sort((a, b) => diasHasta(a.vencimiento) - diasHasta(b.vencimiento)).map(i => {
                    const col = urgenciaColor(i.vencimiento);
                    const d = diasHasta(i.vencimiento);
                    return (
                      <div key={i.id} style={{ background: col.bg, border: `1px solid ${col.border}44`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 4, height: 36, background: col.border, borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e8dfc8", fontWeight: 600, fontSize: 14 }}>{i.nombre}</div>
                          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{propNombre(i.propiedad_id)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Badge color={col}>{d < 0 ? "VENCIDO" : `Vence en ${d} días`}</Badge>
                          <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{i.vencimiento}</div>
                        </div>
                      </div>
                    );
                  })}
                  {inquilinos.filter(i => diasHasta(i.vencimiento) <= 90).length === 0 && (
                    <div style={{ color: "#555", fontSize: 13, padding: "8px 0" }}>✓ No hay contratos urgentes</div>
                  )}
                </div>

                <h3 style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8", marginBottom: 12 }}>Pagos — {mesLabel(MESES[MESES.length-1])}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {inquilinos.map(i => {
                    const ok = pagado(i.id, MESES[MESES.length-1]);
                    return (
                      <div key={i.id} style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: ok ? "#00c273" : "#ff3b3b", display: "inline-block", flexShrink: 0, boxShadow: ok ? "0 0 6px #00c27388" : "0 0 6px #ff3b3b88" }} />
                        <div style={{ flex: 1, color: "#e8dfc8", fontSize: 13 }}>{i.nombre}</div>
                        <div style={{ color: "#666", fontSize: 12 }}>{propNombre(i.propiedad_id).split(",")[0]}</div>
                        <div style={{ color: ok ? "#00c273" : "#ff3b3b", fontWeight: 600, fontSize: 13, minWidth: 110, textAlign: "right" }}>
                          {ok ? `$${(i.alquiler||0).toLocaleString("es-AR")}` : "PENDIENTE"}
                        </div>
                      </div>
                    );
                  })}
                  {inquilinos.length === 0 && <div style={{ color: "#555", fontSize: 13 }}>No hay inquilinos cargados aún</div>}
                </div>
              </div>
            )}

            {/* INQUILINOS */}
            {tab === "inquilinos" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8" }}>Inquilinos</h2>
                    <p style={{ color: "#555", fontSize: 13 }}>{inquilinos.length} contratos activos</p>
                  </div>
                  <button onClick={() => setModal({ tipo: "nuevoInq", data: null })} style={btnPrimary}>+ Nuevo inquilino</button>
                </div>
                <input placeholder="Buscar por nombre o DNI..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ ...inputStyle, maxWidth: 360, marginBottom: 16 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {inquilinos.filter(i => !busqueda || i.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (i.dni||"").includes(busqueda)).map(i => {
                    const col = urgenciaColor(i.vencimiento);
                    const d = diasHasta(i.vencimiento);
                    const mesActual = MESES[MESES.length-1];
                    const ok = pagado(i.id, mesActual);
                    return (
                      <div key={i.id} style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1f2b", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: 16, fontFamily: "DM Serif Display", flexShrink: 0 }}>
                            {i.nombre[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                              <span style={{ color: "#e8dfc8", fontWeight: 600, fontSize: 15 }}>{i.nombre}</span>
                              <Badge color={col}>{d < 0 ? "VENCIDO" : d <= 90 ? `${d}d` : "✓ OK"}</Badge>
                              <span style={{ background: ok ? "#00c27322" : "#ff3b3b22", color: ok ? "#00c273" : "#ff3b3b", border: `1px solid ${ok ? "#00c27344" : "#ff3b3b44"}`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                                {mesLabel(mesActual)} {ok ? "✓" : "PENDIENTE"}
                              </span>
                            </div>
                            <div style={{ color: "#666", fontSize: 12 }}>DNI {i.dni} · {i.tel} · {i.email}</div>
                            <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>📍 {propNombre(i.propiedad_id)}</div>
                            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                              <span style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600 }}>${(i.alquiler||0).toLocaleString("es-AR")}/mes</span>
                              <span style={{ color: "#555", fontSize: 12 }}>Depósito: ${(i.deposito||0).toLocaleString("es-AR")}</span>
                              <span style={{ color: "#555", fontSize: 12 }}>{i.inicio} → <span style={{ color: col.text }}>{i.vencimiento}</span></span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button onClick={() => setModal({ tipo: "editarInq", data: i })} style={{ background: "#1a1f2b", border: "1px solid #2a2f3d", color: "#888", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>Editar</button>
                            <button onClick={() => eliminarInquilino(i.id)} style={{ background: "#ff3b3b11", border: "1px solid #ff3b3b33", color: "#ff3b3b", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {inquilinos.length === 0 && <div style={{ color: "#555", fontSize: 13 }}>No hay inquilinos. ¡Agregá el primero!</div>}
                </div>
              </div>
            )}

            {/* COBRANZAS */}
            {tab === "cobranzas" && (
              <div>
                <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8", marginBottom: 6 }}>Cobranzas</h2>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>Hacé click en ✓/✗ para registrar pagos</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
                  {MESES.map(mes => {
                    const cobrado = inquilinos.filter(i => pagado(i.id, mes)).reduce((s, i) => s + (i.alquiler||0), 0);
                    const total = inquilinos.reduce((s, i) => s + (i.alquiler||0), 0);
                    const pct = total ? Math.round(cobrado / total * 100) : 0;
                    const col = pct === 100 ? "#00c273" : pct >= 50 ? "#f5c842" : "#ff3b3b";
                    return (
                      <div key={mes} style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>{mesLabel(mes)}</div>
                        <div style={{ fontFamily: "DM Serif Display", fontSize: 26, color: col }}>{pct}%</div>
                        <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>${(cobrado/1000).toFixed(0)}K / ${(total/1000).toFixed(0)}K</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: `1fr 120px repeat(${MESES.length}, 68px)`, padding: "12px 16px", borderBottom: "1px solid #1a1f2b" }}>
                    <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase" }}>Inquilino</span>
                    <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase" }}>Alquiler</span>
                    {MESES.map(m => <span key={m} style={{ color: "#555", fontSize: 11, textAlign: "center" }}>{mesLabel(m)}</span>)}
                  </div>
                  {inquilinos.map(i => (
                    <div key={i.id} style={{ display: "grid", gridTemplateColumns: `1fr 120px repeat(${MESES.length}, 68px)`, padding: "13px 16px", borderBottom: "1px solid #0d1015", alignItems: "center" }}>
                      <div>
                        <div style={{ color: "#e8dfc8", fontSize: 13 }}>{i.nombre}</div>
                        <div style={{ color: "#555", fontSize: 11 }}>{propNombre(i.propiedad_id).split(",")[0]}</div>
                      </div>
                      <div style={{ color: "#c9a84c", fontSize: 13 }}>${(i.alquiler||0).toLocaleString("es-AR")}</div>
                      {MESES.map(mes => {
                        const ok = pagado(i.id, mes);
                        return (
                          <div key={mes} style={{ display: "flex", justifyContent: "center" }}>
                            <button onClick={() => togglePago(i.id, mes)} title={ok ? "Marcar como no pagado" : "Marcar como pagado"} style={{ width: 30, height: 30, borderRadius: "50%", background: ok ? "#00c27322" : "#ff3b3b11", border: `1px solid ${ok ? "#00c27366" : "#ff3b3b44"}`, cursor: "pointer", fontSize: 14, color: ok ? "#00c273" : "#ff4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {ok ? "✓" : "✗"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {inquilinos.length === 0 && <div style={{ color: "#555", fontSize: 13, padding: 16 }}>No hay inquilinos cargados</div>}
                </div>
              </div>
            )}

            {/* PROPIEDADES */}
            {tab === "propiedades" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8" }}>Propiedades</h2>
                    <p style={{ color: "#555", fontSize: 13 }}>{propiedades.length} propiedades en cartera</p>
                  </div>
                  <button onClick={() => setModal({ tipo: "nuevaProp", data: null })} style={btnPrimary}>+ Nueva propiedad</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {["todos","alquilada","venta","disponible"].map(f => (
                    <button key={f} onClick={() => setFiltroEstado(f)} style={{ background: filtroEstado === f ? "#c9a84c22" : "#0d0f14", border: `1px solid ${filtroEstado === f ? "#c9a84c" : "#2a2f3d"}`, color: filtroEstado === f ? "#c9a84c" : "#666", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans" }}>
                      {f === "todos" ? "Todos" : f === "alquilada" ? "Alquiladas" : f === "venta" ? "En venta" : "Disponibles"}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                  {propiedades.filter(p => filtroEstado === "todos" || p.estado === filtroEstado).map(p => {
                    const inq = inquilinos.find(i => i.propiedad_id === p.id);
                    const estadoColor = p.estado === "alquilada" ? "#4f8ef7" : p.estado === "venta" ? "#c9a84c" : "#00c273";
                    return (
                      <div key={p.id} style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ background: "#11141a", padding: "14px 16px", borderBottom: "1px solid #1a1f2b", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ color: "#e8dfc8", fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{p.direccion}</div>
                            <div style={{ color: "#666", fontSize: 12, marginTop: 3 }}>{p.tipo} · {p.ambientes} amb · {p.m2}m²</div>
                          </div>
                          <Tag color={estadoColor}>{p.estado === "alquilada" ? "Alquilada" : p.estado === "venta" ? "En venta" : "Disponible"}</Tag>
                        </div>
                        <div style={{ padding: "14px 16px" }}>
                          {p.descripcion && <div style={{ color: "#666", fontSize: 12, marginBottom: 10 }}>{p.descripcion}</div>}
                          {p.estado === "alquilada" && inq && (
                            <div style={{ background: "#1a1f2b", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                              <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>INQUILINO</div>
                              <div style={{ color: "#e8dfc8", fontSize: 13 }}>{inq.nombre}</div>
                              <div style={{ color: "#c9a84c", fontSize: 12, marginTop: 2 }}>${(inq.alquiler||0).toLocaleString("es-AR")}/mes</div>
                              <div style={{ color: urgenciaColor(inq.vencimiento).text, fontSize: 11, marginTop: 2 }}>Vence: {inq.vencimiento}</div>
                            </div>
                          )}
                          {p.estado === "venta" && p.precio && (
                            <div style={{ color: "#c9a84c", fontSize: 18, fontFamily: "DM Serif Display", marginBottom: 10 }}>USD {p.precio.toLocaleString("es-AR")}</div>
                          )}
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setModal({ tipo: "editarProp", data: p })} style={{ background: "#1a1f2b", border: "1px solid #2a2f3d", color: "#888", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>Editar</button>
                            <button onClick={() => eliminarPropiedad(p.id)} style={{ background: "#ff3b3b11", border: "1px solid #ff3b3b33", color: "#ff3b3b", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {propiedades.filter(p => filtroEstado === "todos" || p.estado === filtroEstado).length === 0 && (
                    <div style={{ color: "#555", fontSize: 13 }}>No hay propiedades en esta categoría</div>
                  )}
                </div>
              </div>
            )}
          </>}
        </div>
      </div>

      {(modal?.tipo === "nuevoInq" || modal?.tipo === "editarInq") && (
        <FormInquilino data={modal.data} propiedades={propiedades} onSave={guardarInquilino} onClose={() => setModal(null)} />
      )}
      {(modal?.tipo === "nuevaProp" || modal?.tipo === "editarProp") && (
        <FormPropiedad data={modal.data} onSave={guardarPropiedad} onClose={() => setModal(null)} />
      )}
    </>
  );
}

// ─── FORM INQUILINO ───────────────────────────────────────────────────────
function FormInquilino({ data, propiedades, onSave, onClose }) {
  const [form, setForm] = useState(data || { nombre: "", dni: "", tel: "", email: "", propiedad_id: "", alquiler: "", deposito: "", inicio: "", vencimiento: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.nombre) return alert("El nombre es obligatorio");
    setSaving(true);
    await onSave({ ...form, alquiler: Number(form.alquiler) || null, deposito: Number(form.deposito) || null, propiedad_id: form.propiedad_id ? Number(form.propiedad_id) : null });
    setSaving(false);
  };
  return (
    <Modal title={data ? "Editar inquilino" : "Nuevo inquilino"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Nombre completo</label>
          <input value={form.nombre} onChange={e => set("nombre", e.target.value)} style={inputStyle} autoFocus />
        </div>
        <div><label style={labelStyle}>DNI</label><input value={form.dni||""} onChange={e => set("dni", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Teléfono</label><input value={form.tel||""} onChange={e => set("tel", e.target.value)} style={inputStyle} /></div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={form.email||""} onChange={e => set("email", e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Propiedad</label>
          <select value={form.propiedad_id||""} onChange={e => set("propiedad_id", e.target.value)} style={inputStyle}>
            <option value="">Seleccionar...</option>
            {propiedades.map(p => <option key={p.id} value={p.id}>{p.direccion}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Alquiler mensual ($)</label><input type="number" value={form.alquiler||""} onChange={e => set("alquiler", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Depósito ($)</label><input type="number" value={form.deposito||""} onChange={e => set("deposito", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Inicio del contrato</label><input type="date" value={form.inicio||""} onChange={e => set("inicio", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Vencimiento del contrato</label><input type="date" value={form.vencimiento||""} onChange={e => set("vencimiento", e.target.value)} style={inputStyle} /></div>
      </div>
      <button onClick={submit} disabled={saving} style={{ ...btnPrimary, marginTop: 20, width: "100%", padding: 13, fontSize: 14, opacity: saving ? 0.6 : 1 }}>
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </Modal>
  );
}

// ─── FORM PROPIEDAD ───────────────────────────────────────────────────────
function FormPropiedad({ data, onSave, onClose }) {
  const [form, setForm] = useState(data || { direccion: "", tipo: "Departamento", ambientes: "", m2: "", estado: "disponible", precio: "", descripcion: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.direccion) return alert("La dirección es obligatoria");
    setSaving(true);
    await onSave({ ...form, ambientes: Number(form.ambientes) || null, m2: Number(form.m2) || null, precio: form.precio ? Number(form.precio) : null });
    setSaving(false);
  };
  return (
    <Modal title={data ? "Editar propiedad" : "Nueva propiedad"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Dirección</label>
          <input value={form.direccion} onChange={e => set("direccion", e.target.value)} style={inputStyle} autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select value={form.tipo} onChange={e => set("tipo", e.target.value)} style={inputStyle}>
            {["Departamento","Casa","PH","Local","Oficina","Terreno"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Estado</label>
          <select value={form.estado} onChange={e => set("estado", e.target.value)} style={inputStyle}>
            <option value="disponible">Disponible</option>
            <option value="alquilada">Alquilada</option>
            <option value="venta">En venta</option>
          </select>
        </div>
        <div><label style={labelStyle}>Ambientes</label><input type="number" value={form.ambientes||""} onChange={e => set("ambientes", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Superficie (m²)</label><input type="number" value={form.m2||""} onChange={e => set("m2", e.target.value)} style={inputStyle} /></div>
        {form.estado === "venta" && (
          <div style={{ gridColumn: "1 / span 2" }}>
            <label style={labelStyle}>Precio de venta (USD)</label>
            <input type="number" value={form.precio||""} onChange={e => set("precio", e.target.value)} style={inputStyle} />
          </div>
        )}
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Descripción</label>
          <input value={form.descripcion||""} onChange={e => set("descripcion", e.target.value)} style={inputStyle} placeholder="Características, observaciones..." />
        </div>
      </div>
      <button onClick={submit} disabled={saving} style={{ ...btnPrimary, marginTop: 20, width: "100%", padding: 13, fontSize: 14, opacity: saving ? 0.6 : 1 }}>
        {saving ? "Guardando..." : "Guardar"}
      </button>
    </Modal>
  );
}