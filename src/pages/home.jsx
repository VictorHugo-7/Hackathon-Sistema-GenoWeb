import React, { useState } from "react";
import logo from "../assets/logo.png"
export default function HomePage() {
  const [cancer, setCancer] = useState("Não"); // "Sim" | "Não"
  const [painel, setPainel] = useState("Não"); // "Sim" | "Não"
  const [pdfFile, setPdfFile] = useState(null); // File | null
  const [error, setError] = useState("");

  function onPdfChange(e) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    // validação simples: apenas PDF
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Por favor, selecione um arquivo PDF (.pdf).");
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  }

  function clearPdf() {
    setPdfFile(null);
    setError("");
  }

  // estilos mínimos inline
  const styles = {
    page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", background: "#f7f7fb", minHeight: "100vh" },
    container: { maxWidth: 900, margin: "0 auto", padding: "24px" },
    navbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#111827", color: "#fff", position: "sticky", top: 0, zIndex: 10 },
    brand: { display: "flex", alignItems: "center", gap: 12 },
    logo: { height: 40, width: 40, objectFit: "contain", borderRadius: 6 },
    card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", marginTop: 20 },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#111827" },
    row: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
    radio: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
    hint: { color: "#6b7280", fontSize: 13, marginTop: 6 },
    uploadZone: { border: "2px dashed #d1d5db", borderRadius: 12, padding: 16, background: "#f9fafb" },
    fileInfo: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10, padding: 12, borderRadius: 10, background: "#eef2ff" },
    button: { padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" },
    remove: { padding: "8px 12px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff1f2", color: "#b91c1c", cursor: "pointer" },
    error: { color: "#b91c1c", marginTop: 8, fontSize: 14 },
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.brand}>
          {/* Troque o src abaixo pela sua imagem de logo */}
          <img src={logo} alt="Logo" style={styles.logo} />
          <strong style={{ fontSize: 18 }}>GeneWeb</strong>
        </div>
        <nav>
          {/* Espaço para botões/links extras (Login, etc.) */}
        </nav>
      </header>

      <main style={styles.container}>
        {/* Diagnóstico de Câncer */}
        <section style={styles.card}>
          <h2 style={styles.title}>Diagnóstico de Câncer</h2>
          <div style={styles.row}>
            <label style={styles.radio}>
              <input
                type="radio"
                name="cancer"
                value="Sim"
                checked={cancer === "Sim"}
                onChange={(e) => setCancer(e.target.value)}
              />
              <span>Sim</span>
            </label>

            <label style={styles.radio}>
              <input
                type="radio"
                name="cancer"
                value="Não"
                checked={cancer === "Não"}
                onChange={(e) => setCancer(e.target.value)}
              />
              <span>Não</span>
            </label>
          </div>
          <p style={styles.hint}>Selecione se o paciente possui diagnóstico confirmado.</p>
        </section>

        {/* Painel Genético */}
        <section style={styles.card}>
          <h2 style={styles.title}>Painel Genético</h2>
          <div style={styles.row}>
            <label style={styles.radio}>
              <input
                type="radio"
                name="painel"
                value="Sim"
                checked={painel === "Sim"}
                onChange={(e) => setPainel(e.target.value)}
              />
              <span>Sim</span>
            </label>

            <label style={styles.radio}>
              <input
                type="radio"
                name="painel"
                value="Não"
                checked={painel === "Não"}
                onChange={(e) => setPainel(e.target.value)}
              />
              <span>Não</span>
            </label>
          </div>
          <p style={styles.hint}>Informe se existe painel genético disponível.</p>

          {painel === "Sim" && (
            <div style={{ marginTop: 16 }}>
              <div style={styles.uploadZone}>
                <label htmlFor="pdfUpload" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  Adicionar PDF do Painel Genético
                </label>
                <input
                  id="pdfUpload"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={onPdfChange}
                />
                {error && <div style={styles.error}>{error}</div>}

                {pdfFile && (
                  <div style={styles.fileInfo}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{pdfFile.name}</div>
                      <div style={{ fontSize: 12, color: "#374151" }}>
                        {(pdfFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button type="button" onClick={clearPdf} style={styles.remove}>
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
