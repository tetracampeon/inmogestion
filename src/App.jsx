import { useState, useMemo } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── DATA INICIAL DE EJEMPLO ───────────────────────────────────────────────
const initialInquilinos = [
  { id: 1, nombre: "Martínez, Carlos", dni: "28.341.221", tel: "11-4523-9871", email: "cmartinez@gmail.com", propiedadId: 1, alquiler: 180000, deposito: 360000, vencimiento: "2025-06-15", inicio: "2023-06-15", pagos: { "2025-01": true, "2025-02": true, "2025-03": false, "2025-04": false } },
  { id: 2, nombre: "López, Ana", dni: "35.112.447", tel: "11-6677-1234", email: "ana.lopez@hotmail.com", propiedadId: 2, alquiler: 220000, deposito: 440000, vencimiento: "2026-03-01", inicio: "2024-03-01", pagos: { "2025-01": true, "2025-02": true, "2025-03": true, "2025-04": true } },
  { id: 3, nombre: "Fernández, Luis", dni: "31.009.883", tel: "11-5544-7890", email: "luisfer@yahoo.com", propiedadId: 3, alquiler: 150000, deposito: 300000, vencimiento: "2025-04-30", inicio: "2023-04-30", pagos: { "2025-01": true, "2025-02": false, "2025-03": false, "2025-04": false } },
  { id: 4, nombre: "Gómez, Valeria", dni: "40.221.556", tel: "11-3312-6655", email: "vale.gomez@gmail.com", propiedadId: 4, alquiler: 310000, deposito: 620000, vencimiento: "2026-09-10", inicio: "2024-09-10", pagos: { "2025-01": true, "2025-02": true, "2025-03": true, "2025-04": false } },
];

const initialPropiedades = [
  { id: 1, direccion: "Av. Corrientes 3421, CABA", tipo: "Departamento", ambientes: 2, m2: 55, estado: "alquilada", precio: null, descripcion: "Piso 4, con balcón. Luminoso.", fotos: [] },
  { id: 2, direccion: "Perón 812, Ramos Mejía", tipo: "Casa", ambientes: 4, m2: 120, estado: "alquilada", precio: null, descripcion: "Jardín y garage. Barrio tranquilo.", fotos: [] },
  { id: 3, direccion: "Lavalle 201, Caseros", tipo: "Departamento", ambientes: 1, m2: 38, estado: "alquilada", precio: null, descripcion: "Monoambiente reformado.", fotos: [] },
  { id: 4, direccion: "San Martín 550, Palermo", tipo: "PH", ambientes: 3, m2: 90, estado: "alquilada", precio: null, descripcion: "Planta baja con jardín privado.", fotos: [] },
  { id: 5, direccion: "Belgrano 1100, Quilmes", tipo: "Casa", ambientes: 5, m2: 200, estado: "venta", precio: 185000, descripcion: "Amplia casa con pileta.", fotos: [] },
  { id: 6, direccion: "Independencia 430, CABA", tipo: "Departamento", ambientes: 3, m2: 80, estado: "venta", precio: 120000, descripcion: "Piso 8, vista al río.", fotos: [] },
  { id: 7, direccion: "Rivadavia 2200, Morón", tipo: "Local", ambientes: 1, m2: 60, estado: "disponible", precio: null, descripcion: "Local comercial. Excelente ubicación.", fotos: [] },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
const hoy = new Date("2025-04-09");

function diasHasta(fechaStr) {
  const f = new Date(fechaStr);
  return Math.round((f - hoy) / (1000 * 60 * 60 * 24));
}

function urgencia(dias) {
  if (dias < 0) return "vencido";
  if (dis <= 30) return "critico";
  if (dis <= 90) return "proximo";
  return "ok";
  function dis() { return dias; }
}

function urgenciaColor(fechaStr) {
  const d = diasHasta(fechaStr);
  if (d < 0) return { bg: "#ff3b3b22", border: "#ff3b3b", text: "#ff3b3b", label: "VENCIDO" };
  if (d <= 30) return { bg: "#ff6b0022", border: "#ff6b00", text: "#ff6b00", label: `${d}d` };
  if (d <= 90) return { bg: "#f5c84222", border: "#f5c842", text: "#c9a200", label: `${d}d` };
  return { bg: "#00c27322", border: "#00c273", text: "#00a862", label: `${d}d` };
}

const MESES = ["2025-01", "2025-02", "2025-03", "2025-04"];
const MESES_LABEL = ["Ene", "Feb", "Mar", "Abr"];

// ─── COMPONENTES UI ────────────────────────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{
    background: color.bg, border: `1px solid ${color.border}`,
    color: color.text, borderRadius: 6, padding: "2px 8px",
    fontSize: 11, fontWeight: 600, fontFamily: "DM Sans",
    letterSpacing: 0.5, whiteSpace: "nowrap"
  }}>{children}</span>
);

const Dot = ({ ok }) => (
  <span style={{
    display: "inline-block", width: 10, height: 10, borderRadius: "50%",
    background: ok ? "#00c273" : "#ff3b3b",
    boxShadow: ok ? "0 0 6px #00c27388" : "0 0 6px #ff3b3b88"
  }} />
);

const Tag = ({ children, color = "#8b5cf6" }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 500
  }}>{children}</span>
);

// ─── MODAL ─────────────────────────────────────────────────────────────────
function Modal({ onClose, children, title }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#00000088",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#141820", border: "1px solid #2a2f3d", borderRadius: 16,
        width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 28
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: "DM Serif Display", fontSize: 22, color: "#e8dfc8" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#0e1117", border: "1px solid #2a2f3d", borderRadius: 8,
  color: "#e8dfc8", padding: "9px 12px", fontSize: 13, fontFamily: "DM Sans",
  width: "100%", outline: "none", boxSizing: "border-box"
};
const labelStyle = { fontSize: 11, color: "#888", fontFamily: "DM Sans", display: "block", marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" };

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [inquilinos, setInquilinos] = useState(initialInquilinos);
  const [propiedades, setPropiedades] = useState(initialPropiedades);
  const [modal, setModal] = useState(null); // { tipo, data }
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Stats dashboard
  const stats = useMemo(() => {
    const alquiladas = propiedades.filter(p => p.estado === "alquilada").length;
    const enVenta = propiedades.filter(p => p.estado === "venta").length;
    const disponibles = propiedades.filter(p => p.estado === "disponible").length;
    const vencenProximo = inquilinos.filter(i => { const d = diasHasta(i.vencimiento); return d >= 0 && d <= 60; }).length;
    const vencidos = inquilinos.filter(i => diasHasta(i.vencimiento) < 0).length;
    const mesActual = MESES[MESES.length - 1];
    const cobradosMes = inquilinos.filter(i => i.pagos[mesActual]).length;
    const ingresosMes = inquilinos.filter(i => i.pagos[mesActual]).reduce((s, i) => s + i.alquiler, 0);
    const pendientesMes = inquilinos.filter(i => !i.pagos[mesActual]).reduce((s, i) => s + i.alquiler, 0);
    return { alquiladas, enVenta, disponibles, vencenProximo, vencidos, cobradosMes, ingresosMes, pendientesMes };
  }, [inquilinos, propiedades]);

  function togglePago(inqId, mes) {
    setInquilinos(prev => prev.map(i =>
      i.id === inqId ? { ...i, pagos: { ...i.pagos, [mes]: !i.pagos[mes] } } : i
    ));
  }

  function guardarInquilino(data) {
    if (data.id) {
      setInquilinos(prev => prev.map(i => i.id === data.id ? data : i));
    } else {
      setInquilinos(prev => [...prev, { ...data, id: Date.now(), pagos: {} }]);
    }
    setModal(null);
  }

  function eliminarInquilino(id) {
    if (confirm("¿Eliminar este inquilino?")) setInquilinos(prev => prev.filter(i => i.id !== id));
  }

  function guardarPropiedad(data) {
    if (data.id) {
      setPropiedades(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      setPropiedades(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setModal(null);
  }

  function eliminarPropiedad(id) {
    if (confirm("¿Eliminar esta propiedad?")) setPropiedades(prev => prev.filter(p => p.id !== id));
  }

  const propiedadNombre = (id) => {
    const p = propiedades.find(p => p.id === id);
    return p ? p.direccion : "–";
  };

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
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0c10", display: "flex", fontFamily: "DM Sans, sans-serif" }}>

        {/* SIDEBAR */}
        <div style={{
          width: 220, background: "#0d0f14", borderRight: "1px solid #1a1f2b",
          display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0, minHeight: "100vh"
        }}>
          <div style={{ padding: "0 20px 28px" }}>
            <div style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8", lineHeight: 1.2 }}>
              InmoGestión
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3, letterSpacing: 1 }}>PANEL INMOBILIARIO</div>
          </div>

          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 20px",
              background: tab === t.id ? "#1a1f2b" : "none",
              borderLeft: tab === t.id ? "2px solid #c9a84c" : "2px solid transparent",
              border: "none", borderRight: "none",
              color: tab === t.id ? "#e8dfc8" : "#666",
              fontFamily: "DM Sans", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
            </button>
          ))}

          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid #1a1f2b" }}>
            <div style={{ fontSize: 11, color: "#444" }}>Abril 2025</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{inquilinos.length} inquilinos activos</div>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8", marginBottom: 6 }}>
                Resumen general
              </h2>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Estado actual de tu inmobiliaria</p>

              {/* CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
                {[
                  { label: "Propiedades alquiladas", val: stats.alquiladas, color: "#00c273", icon: "🏠" },
                  { label: "En venta", val: stats.enVenta, color: "#4f8ef7", icon: "🏷️" },
                  { label: "Disponibles", val: stats.disponibles, color: "#888", icon: "🔑" },
                  { label: "Contratos por vencer (60d)", val: stats.vencenProximo, color: "#f5c842", icon: "⚠️" },
                  { label: "Contratos vencidos", val: stats.vencidos, color: "#ff3b3b", icon: "🔴" },
                  { label: "Cobrado este mes", val: `$${(stats.ingresosMes / 1000).toFixed(0)}K`, color: "#00c273", icon: "💰" },
                  { label: "Pendiente este mes", val: `$${(stats.pendientesMes / 1000).toFixed(0)}K`, color: "#ff6b00", icon: "📋" },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: "#0d0f14", border: `1px solid ${c.color}33`,
                    borderRadius: 12, padding: "18px 16px"
                  }}>
                    <div style={{ fontSize: 22 }}>{c.icon}</div>
                    <div style={{ fontFamily: "DM Serif Display", fontSize: 28, color: c.color, margin: "6px 0 4px" }}>{c.val}</div>
                    <div style={{ fontSize: 11, color: "#666", lineHeight: 1.3 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* ALERTAS */}
              <h3 style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8", marginBottom: 12 }}>
                Contratos que necesitan atención
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inquilinos
                  .filter(i => diasHasta(i.vencimiento) <= 90)
                  .sort((a, b) => diasHasta(a.vencimiento) - diasHasta(b.vencimiento))
                  .map(i => {
                    const col = urgenciaColor(i.vencimiento);
                    const d = diasHasta(i.vencimiento);
                    return (
                      <div key={i.id} style={{
                        background: col.bg, border: `1px solid ${col.border}44`,
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: 14
                      }}>
                        <div style={{ width: 4, height: 36, background: col.border, borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e8dfc8", fontWeight: 600, fontSize: 14 }}>{i.nombre}</div>
                          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{propiedadNombre(i.propiedadId)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Badge color={col}>{d < 0 ? "VENCIDO" : `Vence en ${d} días`}</Badge>
                          <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>{i.vencimiento}</div>
                        </div>
                      </div>
                    );
                  })}
                {inquilinos.filter(i => diasHasta(i.vencimiento) <= 90).length === 0 && (
                  <div style={{ color: "#555", fontSize: 13, padding: "16px 0" }}>✓ No hay contratos urgentes</div>
                )}
              </div>

              {/* PAGOS ESTE MES */}
              <h3 style={{ fontFamily: "DM Serif Display", fontSize: 20, color: "#e8dfc8", margin: "28px 0 12px" }}>
                Pagos — Abril 2025
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inquilinos.map(i => {
                  const pagado = i.pagos["2025-04"];
                  return (
                    <div key={i.id} style={{
                      background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 10,
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: 12
                    }}>
                      <Dot ok={pagado} />
                      <div style={{ flex: 1, color: "#e8dfc8", fontSize: 13 }}>{i.nombre}</div>
                      <div style={{ color: "#666", fontSize: 12 }}>{propiedadNombre(i.propiedadId)}</div>
                      <div style={{ color: pagado ? "#00c273" : "#ff3b3b", fontWeight: 600, fontSize: 13, width: 90, textAlign: "right" }}>
                        {pagado ? `$${i.alquiler.toLocaleString("es-AR")}` : "PENDIENTE"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── INQUILINOS ── */}
          {tab === "inquilinos" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8" }}>Inquilinos</h2>
                  <p style={{ color: "#555", fontSize: 13 }}>Contratos de alquiler activos</p>
                </div>
                <button onClick={() => setModal({ tipo: "nuevoInquilino", data: null })} style={{
                  background: "#c9a84c", color: "#0a0c10", border: "none", borderRadius: 8,
                  padding: "9px 18px", fontFamily: "DM Sans", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>+ Nuevo inquilino</button>
              </div>

              <input
                placeholder="Buscar por nombre, DNI o dirección..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, marginBottom: 16, maxWidth: 380 }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {inquilinos
                  .filter(i =>
                    !busqueda ||
                    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    i.dni.includes(busqueda) ||
                    propiedadNombre(i.propiedadId).toLowerCase().includes(busqueda.toLowerCase())
                  )
                  .map(i => {
                    const col = urgenciaColor(i.vencimiento);
                    const d = diasHasta(i.vencimiento);
                    const mesActual = MESES[MESES.length - 1];
                    const pagadoMes = i.pagos[mesActual];
                    return (
                      <div key={i.id} style={{
                        background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, padding: "18px 20px"
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: "50%", background: "#1a1f2b",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#c9a84c", fontSize: 16, fontFamily: "DM Serif Display", flexShrink: 0
                          }}>
                            {i.nombre[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <span style={{ color: "#e8dfc8", fontWeight: 600, fontSize: 15 }}>{i.nombre}</span>
                              <Badge color={col}>{d < 0 ? "VENCIDO" : d <= 30 ? `${d}d` : d <= 90 ? `${d}d` : "OK"}</Badge>
                              <span style={{
                                background: pagadoMes ? "#00c27322" : "#ff3b3b22",
                                color: pagadoMes ? "#00c273" : "#ff3b3b",
                                border: `1px solid ${pagadoMes ? "#00c27344" : "#ff3b3b44"}`,
                                borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600
                              }}>{pagadoMes ? "ABR ✓" : "ABR PENDIENTE"}</span>
                            </div>
                            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                              DNI {i.dni} · {i.tel} · {i.email}
                            </div>
                            <div style={{ color: "#888", fontSize: 12, marginTop: 3 }}>
                              📍 {propiedadNombre(i.propiedadId)}
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                              <span style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600 }}>
                                ${i.alquiler.toLocaleString("es-AR")}/mes
                              </span>
                              <span style={{ color: "#555", fontSize: 12 }}>
                                Depósito: ${i.deposito.toLocaleString("es-AR")}
                              </span>
                              <span style={{ color: "#555", fontSize: 12 }}>
                                Inicio: {i.inicio} · Vence: <span style={{ color: col.text }}>{i.vencimiento}</span>
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setModal({ tipo: "editarInquilino", data: i })} style={{
                              background: "#1a1f2b", border: "1px solid #2a2f3d", color: "#888",
                              borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12
                            }}>Editar</button>
                            <button onClick={() => eliminarInquilino(i.id)} style={{
                              background: "#ff3b3b11", border: "1px solid #ff3b3b33", color: "#ff3b3b",
                              borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12
                            }}>✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ── COBRANZAS ── */}
          {tab === "cobranzas" && (
            <div>
              <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8", marginBottom: 6 }}>Cobranzas</h2>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>Registrá los pagos de alquiler mes a mes</p>

              {/* Totales */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
                {MESES.map((mes, idx) => {
                  const cobrado = inquilinos.filter(i => i.pagos[mes]).reduce((s, i) => s + i.alquiler, 0);
                  const total = inquilinos.reduce((s, i) => s + i.alquiler, 0);
                  const pct = Math.round(cobrado / total * 100);
                  return (
                    <div key={mes} style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>{MESES_LABEL[idx]} 2025</div>
                      <div style={{ fontFamily: "DM Serif Display", fontSize: 22, color: pct === 100 ? "#00c273" : pct >= 50 ? "#f5c842" : "#ff3b3b" }}>
                        {pct}%
                      </div>
                      <div style={{ color: "#666", fontSize: 11, marginTop: 4 }}>
                        ${(cobrado / 1000).toFixed(0)}K / ${(total / 1000).toFixed(0)}K
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabla */}
              <div style={{ background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px repeat(4, 60px)", padding: "12px 16px", borderBottom: "1px solid #1a1f2b" }}>
                  <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Inquilino</span>
                  <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Alquiler</span>
                  {MESES_LABEL.map(m => (
                    <span key={m} style={{ color: "#555", fontSize: 11, textTransform: "uppercase", textAlign: "center" }}>{m}</span>
                  ))}
                </div>
                {inquilinos.map(i => (
                  <div key={i.id} style={{
                    display: "grid", gridTemplateColumns: "1fr 120px repeat(4, 60px)",
                    padding: "13px 16px", borderBottom: "1px solid #11141a", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ color: "#e8dfc8", fontSize: 13, fontWeight: 500 }}>{i.nombre}</div>
                      <div style={{ color: "#555", fontSize: 11 }}>{propiedadNombre(i.propiedadId).split(",")[0]}</div>
                    </div>
                    <div style={{ color: "#c9a84c", fontSize: 13 }}>${i.alquiler.toLocaleString("es-AR")}</div>
                    {MESES.map(mes => (
                      <div key={mes} style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          onClick={() => togglePago(i.id, mes)}
                          title={i.pagos[mes] ? "Marcar como no pagado" : "Marcar como pagado"}
                          style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: i.pagos[mes] ? "#00c27322" : "#ff3b3b11",
                            border: `1px solid ${i.pagos[mes] ? "#00c27366" : "#ff3b3b44"}`,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13
                          }}
                        >
                          {i.pagos[mes] ? "✓" : "✗"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p style={{ color: "#444", fontSize: 11, marginTop: 10 }}>Hacé click en ✓/✗ para cambiar el estado de pago</p>
            </div>
          )}

          {/* ── PROPIEDADES ── */}
          {tab === "propiedades" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "DM Serif Display", fontSize: 28, color: "#e8dfc8" }}>Propiedades</h2>
                  <p style={{ color: "#555", fontSize: 13 }}>Alquileres, ventas y disponibles</p>
                </div>
                <button onClick={() => setModal({ tipo: "nuevaProp", data: null })} style={{
                  background: "#c9a84c", color: "#0a0c10", border: "none", borderRadius: 8,
                  padding: "9px 18px", fontFamily: "DM Sans", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>+ Nueva propiedad</button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["todos", "alquilada", "venta", "disponible"].map(f => (
                  <button key={f} onClick={() => setFiltroEstado(f)} style={{
                    background: filtroEstado === f ? "#c9a84c22" : "#0d0f14",
                    border: `1px solid ${filtroEstado === f ? "#c9a84c" : "#2a2f3d"}`,
                    color: filtroEstado === f ? "#c9a84c" : "#666",
                    borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "DM Sans"
                  }}>
                    {f === "todos" ? "Todos" : f === "alquilada" ? "Alquiladas" : f === "venta" ? "En venta" : "Disponibles"}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {propiedades
                  .filter(p => filtroEstado === "todos" || p.estado === filtroEstado)
                  .map(p => {
                    const inq = inquilinos.find(i => i.propiedadId === p.id);
                    const estadoColor = p.estado === "alquilada" ? "#4f8ef7" : p.estado === "venta" ? "#c9a84c" : "#00c273";
                    return (
                      <div key={p.id} style={{
                        background: "#0d0f14", border: "1px solid #1a1f2b", borderRadius: 12, overflow: "hidden"
                      }}>
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
                              <div style={{ color: "#c9a84c", fontSize: 12, marginTop: 2 }}>${inq.alquiler.toLocaleString("es-AR")}/mes</div>
                              <div style={{ color: urgenciaColor(inq.vencimiento).text, fontSize: 11, marginTop: 2 }}>
                                Vence: {inq.vencimiento}
                              </div>
                            </div>
                          )}
                          {p.estado === "venta" && (
                            <div style={{ color: "#c9a84c", fontSize: 16, fontFamily: "DM Serif Display", marginBottom: 10 }}>
                              USD {p.precio?.toLocaleString("es-AR")}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setModal({ tipo: "editarProp", data: p })} style={{
                              background: "#1a1f2b", border: "1px solid #2a2f3d", color: "#888",
                              borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12
                            }}>Editar</button>
                            <button onClick={() => eliminarPropiedad(p.id)} style={{
                              background: "#ff3b3b11", border: "1px solid #ff3b3b33", color: "#ff3b3b",
                              borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12
                            }}>✕</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALES ── */}
      {(modal?.tipo === "nuevoInquilino" || modal?.tipo === "editarInquilino") && (
        <FormInquilino
          data={modal.data}
          propiedades={propiedades}
          onSave={guardarInquilino}
          onClose={() => setModal(null)}
        />
      )}
      {(modal?.tipo === "nuevaProp" || modal?.tipo === "editarProp") && (
        <FormPropiedad
          data={modal.data}
          onSave={guardarPropiedad}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

// ─── FORM INQUILINO ────────────────────────────────────────────────────────
function FormInquilino({ data, propiedades, onSave, onClose }) {
  const [form, setForm] = useState(data || {
    nombre: "", dni: "", tel: "", email: "",
    propiedadId: "", alquiler: "", deposito: "",
    inicio: "", vencimiento: "", pagos: {}
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.nombre || !form.alquiler) return alert("Completá nombre y alquiler");
    onSave({ ...form, alquiler: Number(form.alquiler), deposito: Number(form.deposito), propiedadId: Number(form.propiedadId) });
  };
  return (
    <Modal title={data ? "Editar inquilino" : "Nuevo inquilino"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          ["nombre", "Nombre completo", "text", "1fr 1fr", "1 / span 2"],
          ["dni", "DNI", "text"],
          ["tel", "Teléfono", "text"],
          ["email", "Email", "email", "1 / span 2"],
        ].map(([k, label, type, , span]) => (
          <div key={k} style={{ gridColumn: span }}>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} style={inputStyle} />
          </div>
        ))}
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Propiedad</label>
          <select value={form.propiedadId} onChange={e => set("propiedadId", e.target.value)} style={inputStyle}>
            <option value="">Seleccionar...</option>
            {propiedades.map(p => <option key={p.id} value={p.id}>{p.direccion}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Alquiler mensual ($)</label>
          <input type="number" value={form.alquiler} onChange={e => set("alquiler", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Depósito ($)</label>
          <input type="number" value={form.deposito} onChange={e => set("deposito", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Inicio del contrato</label>
          <input type="date" value={form.inicio} onChange={e => set("inicio", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Vencimiento del contrato</label>
          <input type="date" value={form.vencimiento} onChange={e => set("vencimiento", e.target.value)} style={inputStyle} />
        </div>
      </div>
      <button onClick={submit} style={{
        marginTop: 20, background: "#c9a84c", color: "#0a0c10", border: "none",
        borderRadius: 8, padding: "11px 24px", fontFamily: "DM Sans", fontSize: 14,
        fontWeight: 600, cursor: "pointer", width: "100%"
      }}>Guardar</button>
    </Modal>
  );
}

// ─── FORM PROPIEDAD ────────────────────────────────────────────────────────
function FormPropiedad({ data, onSave, onClose }) {
  const [form, setForm] = useState(data || {
    direccion: "", tipo: "Departamento", ambientes: "", m2: "",
    estado: "disponible", precio: "", descripcion: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.direccion) return alert("Ingresá la dirección");
    onSave({ ...form, ambientes: Number(form.ambientes), m2: Number(form.m2), precio: form.precio ? Number(form.precio) : null });
  };
  return (
    <Modal title={data ? "Editar propiedad" : "Nueva propiedad"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Dirección</label>
          <input value={form.direccion} onChange={e => set("direccion", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select value={form.tipo} onChange={e => set("tipo", e.target.value)} style={inputStyle}>
            {["Departamento", "Casa", "PH", "Local", "Oficina", "Terreno"].map(t => <option key={t}>{t}</option>)}
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
        <div>
          <label style={labelStyle}>Ambientes</label>
          <input type="number" value={form.ambientes} onChange={e => set("ambientes", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Superficie (m²)</label>
          <input type="number" value={form.m2} onChange={e => set("m2", e.target.value)} style={inputStyle} />
        </div>
        {form.estado === "venta" && (
          <div style={{ gridColumn: "1 / span 2" }}>
            <label style={labelStyle}>Precio de venta (USD)</label>
            <input type="number" value={form.precio} onChange={e => set("precio", e.target.value)} style={inputStyle} />
          </div>
        )}
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={labelStyle}>Descripción</label>
          <input value={form.descripcion} onChange={e => set("descripcion", e.target.value)} style={inputStyle} placeholder="Características, observaciones..." />
        </div>
      </div>
      <button onClick={submit} style={{
        marginTop: 20, background: "#c9a84c", color: "#0a0c10", border: "none",
        borderRadius: 8, padding: "11px 24px", fontFamily: "DM Sans", fontSize: 14,
        fontWeight: 600, cursor: "pointer", width: "100%"
      }}>Guardar</button>
    </Modal>
  );
}
