import { useState } from "react";

const GQL = "https://graphperu.daustinn.com/api/graphql";

async function fetchDNI(dni) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { person(match: "${dni}") { documentID surnames names resourceOf } }`,
    }),
  });
  const json = await res.json();
  return json?.data?.person ?? null;
}

async function fetchRUC(ruc) {
  const res = await fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query { business(match: "${ruc}") { documentID name resourceOf } }`,
    }),
  });
  const json = await res.json();
  return json?.data?.business ?? null;
}

function initials(str = "") {
  return str
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Row({ label, value, mono, small }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 20px",
        borderBottom: "1px solid #f0f0f0",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 12, color: "#aaa" }}>{label}</span>
      <span
        style={{
          fontSize: small ? 11 : 14,
          color: "#111",
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-word",
          maxWidth: "65%",
          fontFamily: mono ? "monospace" : "inherit",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("dni");
  const [doc, setDoc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const maxLen = mode === "dni" ? 8 : 11;
  const accent = mode === "dni" ? "#e85d2f" : "#1a9e6e";
  const lightBg = mode === "dni" ? "#fff3ee" : "#edf9f4";
  const lightColor = mode === "dni" ? "#a33d1a" : "#0d6e4a";

  const reset = () => {
    setResult(null);
    setError("");
  };
  const changeMode = (m) => {
    setMode(m);
    setDoc("");
    reset();
  };
  const buscar = async () => {
    reset();
    if (doc.length !== maxLen) {
      setError(`El ${mode.toUpperCase()} debe tener exactamente ${maxLen} dígitos`);
      return;
    }
    setLoading(true);
    try {
      const data = mode === "dni" ? await fetchDNI(doc) : await fetchRUC(doc);
      if (!data) throw new Error("No encontrado");
      setResult(data);
    } catch {
      setError("No se encontró información para ese número.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fullName = result
    ? mode === "dni"
      ? `${result.names || ""} ${result.surnames || ""}`.trim()
      : result.name || ""
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 34%), linear-gradient(180deg, #0b2b57 0%, #164686 36%, #f5f5f0 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2.5rem 1rem 4rem",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 860 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            color: "#fff",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Identidad digital
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: 34, maxWidth: 540, lineHeight: 1.05 }}>
              Consulta DNI y RUC con un estilo más dinámico.
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => scrollToSection("top")}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-to-use")}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                border: `1px solid ${accent}`,
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cómo usar
            </button>
          </div>
        </header>

        <section
          id="top"
          style={{
            padding: "26px 26px 28px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.2)",
            marginBottom: 24,
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "1.4fr 0.9fr",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>
                Usa la página como una herramienta interactiva para buscar información oficial de personas y empresas.
              </p>
              <p style={{ margin: "16px 0 0", fontSize: 18, lineHeight: 1.7, maxWidth: 600 }}>
                Elige DNI o RUC, escribe el número y obtén una tarjeta de resultados clara y ordenada.
              </p>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Búsqueda rápida", value: "Enter para buscar" },
                { label: "Modo fácil", value: "Cambia con un clic" },
                { label: "Resultados", value: "Formato legible" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>{item.label}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 700 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-to-use"
          style={{
            marginBottom: 24,
            padding: "26px 28px",
            borderRadius: 28,
            background: "#ffffff",
            boxShadow: "0 24px 60px rgba(12, 55, 96, 0.08)",
            color: "#111",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5f6575" }}>
                Cómo usar
              </p>
              <h2 style={{ margin: "12px 0 0", fontSize: 26, lineHeight: 1.2 }}>
                Tres pasos simples para buscar rápido.
              </h2>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 36,
                  minHeight: 36,
                  borderRadius: 999,
                  background: accent,
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                +
              </span>
              <p style={{ margin: 0, color: "#555", maxWidth: 380 }}>
                Marca “Inicio” para volver arriba y “Cómo usar” para ver estos pasos nuevamente.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
            {[
              { title: "1. Selecciona", text: "Elige DNI o RUC antes de buscar." },
              { title: "2. Escribe", text: `Ingresa ${mode === "dni" ? "8 dígitos de DNI" : "11 dígitos de RUC"}.` },
              { title: "3. Busca", text: "Pulsa Buscar o Enter y revisa el resultado." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "18px 20px",
                  borderRadius: 18,
                  background: "#f8fbff",
                  border: "1px solid #e5eef8",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    background: lightBg,
                    color: lightColor,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                  }}
                >
                  {item.title[0]}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{item.title}</p>
                  <p style={{ margin: "6px 0 0", color: "#555", lineHeight: 1.6 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            padding: "4px 12px",
            borderRadius: 999,
            border: "1px solid #ddd",
            color: "#888",
            marginBottom: 16,
            background: "#fff",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#e85d2f",
              display: "inline-block",
            }}
          />
          RENIEC · SUNAT
        </div>

        {/* Título */}
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>
          Consulta de identidad
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 24px" }}>
          Busca personas por DNI o empresas por RUC.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#e8e8e3",
            borderRadius: 14,
            padding: 4,
            gap: 4,
            marginBottom: 20,
          }}
        >
          {["dni", "ruc"].map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                border: mode === m ? "1px solid #ddd" : "none",
                background: mode === m ? "#fff" : "transparent",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                color: mode === m ? "#111" : "#888",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: m === "dni" ? "#e85d2f" : "#1a9e6e",
                }}
              />
              {m === "dni" ? "Persona / DNI" : "Empresa / RUC"}
            </button>
          ))}
        </div>

        {/* Input + Botón */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={doc}
            maxLength={maxLen}
            placeholder={`Ingrese ${mode === "dni" ? "DNI" : "RUC"}`}
            onChange={(e) => {
              setDoc(e.target.value.replace(/\D/g, ""));
              reset();
            }}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
            style={{
              flex: 1,
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              fontSize: 18,
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              outline: "none",
              color: "#111",
            }}
          />
          <button
            onClick={buscar}
            disabled={loading}
            style={{
              padding: "13px 22px",
              borderRadius: 12,
              border: "none",
              background: accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            Buscar
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#aaa", fontFamily: "monospace", marginTop: 6 }}>
          {maxLen} dígitos · solo números · Enter para buscar
        </p>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 14,
              padding: "11px 16px",
              borderRadius: 10,
              background: "#fff0f0",
              color: "#c0392b",
              fontSize: 14,
              border: "1px solid #fcc",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#888",
              fontSize: 14,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid #ddd",
                borderTopColor: "#888",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Consultando base de datos...
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div
            style={{
              marginTop: 20,
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Header de la tarjeta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: lightBg,
                  color: lightColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {initials(fullName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#111", margin: 0 }}>
                  {fullName || "—"}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "#aaa",
                    margin: "2px 0 0",
                  }}
                >
                  {mode.toUpperCase()} · {result.documentID}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: lightBg,
                  color: lightColor,
                  whiteSpace: "nowrap",
                }}
              >
                {mode === "dni" ? "Persona natural" : "Persona jurídica"}
              </span>
            </div>

            {/* Filas de datos */}
            {mode === "dni" ? (
              <>
                <Row label="DNI" value={result.documentID} mono />
                <Row label="Nombres" value={result.names} />
                <Row label="Apellidos" value={result.surnames} />
                {result.resourceOf && (
                  <Row label="Fuente" value={result.resourceOf} mono small />
                )}
              </>
            ) : (
              <>
                <Row label="RUC" value={result.documentID} mono />
                <Row label="Razón social" value={result.name} />
                {result.resourceOf && (
                  <Row label="Fuente" value={result.resourceOf} mono small />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; } body { margin: 0; }`}</style>
    </div>
  );
}