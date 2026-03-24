import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { getAvailableEHRSystems, exportToEHR } from "../services/mockEHRExportService";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ErrorRetry } from "../components/ErrorRetry";
import type { EHRSystem, ExportResult } from "../types";

type ScreenPhase = "loading" | "select" | "exporting" | "success" | "error";

export default function EHRExportScreen() {
  const navigate = useNavigate();
  const {
    editedNoteContent, dataRetentionConfirmed, transcription,
    attestationTimestamp, resetSession,
  } = useAmbientNotes();

  const [phase, setPhase] = useState<ScreenPhase>("loading");
  const [systems, setSystems] = useState<EHRSystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAvailableEHRSystems().then((result) => {
      if (!cancelled) { setSystems(result); setPhase("select"); }
    });
    return () => { cancelled = true; };
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedSystemId) return;
    setPhase("exporting");
    setErrorMessage("");
    try {
      const transcript = dataRetentionConfirmed ? transcription : undefined;
      const result = await exportToEHR(selectedSystemId, editedNoteContent, transcript || undefined);
      setExportResult(result);
      setPhase("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Export failed.");
      setPhase("error");
    }
  }, [selectedSystemId, editedNoteContent, dataRetentionConfirmed, transcription]);

  const handleStartNewSession = () => {
    resetSession();
    navigate("/ambient-notes");
  };

  if (phase === "loading") return <div style={centeredStyle}><LoadingIndicator message="Loading EHR systems..." /></div>;
  if (phase === "exporting") return <div style={centeredStyle}><LoadingIndicator message="Exporting to EHR..." /></div>;
  if (phase === "error") return <div style={centeredStyle}><ErrorRetry message={errorMessage} onRetry={handleExport} /></div>;

  if (phase === "success" && exportResult) {
    return (
      <div style={pageStyle}>
        <div style={successBoxStyle}>
          <div style={successIconStyle}>✓</div>
          <h2 style={successTitleStyle}>Export Successful</h2>
          <div style={detailsStyle}>
            <DetailRow label="EHR System" value={exportResult.ehrSystem} />
            <DetailRow label="Reference ID" value={exportResult.referenceId} />
            <DetailRow label="Exported At" value={new Date(exportResult.timestamp).toLocaleString()} />
            {attestationTimestamp && (
              <DetailRow label="Attested At" value={new Date(attestationTimestamp).toLocaleString()} />
            )}
          </div>
          <button onClick={handleStartNewSession} style={newSessionBtnStyle}>Start New Session</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Export to EHR</h2>
        <p style={subStyle}>Select an EHR system to export the finalized clinical note.</p>
      </div>

      <div style={systemsGridStyle}>
        {systems.map((system) => (
          <button key={system.id} onClick={() => setSelectedSystemId(system.id)}
            style={{
              ...systemCardStyle,
              borderColor: selectedSystemId === system.id ? "var(--accent)" : "var(--border)",
              backgroundColor: selectedSystemId === system.id ? "var(--accent-soft)" : "var(--bg-card)",
            }}>
            <span style={{ fontSize: 28 }}>{system.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{system.name}</span>
          </button>
        ))}
      </div>

      <button onClick={handleExport} disabled={!selectedSystemId}
        style={{ ...exportBtnStyle, opacity: selectedSystemId ? 1 : 0.4, cursor: selectedSystemId ? "pointer" : "not-allowed" }}>
        Export
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

/* ---------- Styles ---------- */

const centeredStyle: React.CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "48px 24px" };

const pageStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "40px 24px",
};

const headerStyle: React.CSSProperties = { marginBottom: 28 };

const headingStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "var(--text-primary)",
  margin: 0,
  letterSpacing: "-0.03em",
};

const subStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--text-muted)",
  margin: "6px 0 0",
};

const systemsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
  gap: 12,
  marginBottom: 28,
};

const systemCardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: "20px 16px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  background: "none",
  fontFamily: "var(--font)",
};

const exportBtnStyle: React.CSSProperties = {
  padding: "14px 32px",
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  backgroundColor: "var(--accent)",
  border: "none",
  borderRadius: "var(--radius-md)",
  width: "100%",
  boxShadow: "0 4px 16px rgba(249,115,22,0.2)",
  transition: "all 0.2s ease",
  letterSpacing: "-0.01em",
};

const successBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: "48px 32px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  textAlign: "center",
};

const successIconStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  backgroundColor: "var(--success-soft)",
  color: "var(--success)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: 700,
};

const successTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em",
};

const detailsStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  display: "flex",
  flexDirection: "column",
};

const newSessionBtnStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "12px 32px",
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  backgroundColor: "var(--accent)",
  border: "none",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(249,115,22,0.2)",
  transition: "box-shadow 0.2s ease",
};
