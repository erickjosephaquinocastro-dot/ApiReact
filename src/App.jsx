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

  const fullName = result
    ? mode === "dni"
      ? `${result.names || ""} ${result.surnames || ""}`.trim()
      : result.name || ""
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>

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