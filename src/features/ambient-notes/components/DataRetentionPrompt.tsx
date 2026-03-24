import React from "react";

interface DataRetentionPromptProps {
  onConfirmSave: () => void;
  onDeclinePurge: () => void;
}

export const DataRetentionPrompt: React.FC<DataRetentionPromptProps> = ({ onConfirmSave, onDeclinePurge }) => {
  return (
    <div style={cardStyle}>
      <div style={iconRow}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <h3 style={titleStyle}>Data Retention Decision</h3>
      </div>

      <p style={bodyStyle}>
        Raw audio and transcription data is currently held in volatile memory and will be
        permanently deleted unless you choose to save it. This data is not recoverable after purging.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onConfirmSave} style={saveBtnStyle}>Save Raw Data</button>
        <button onClick={onDeclinePurge} style={purgeBtnStyle}>Purge Data</button>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: 28,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  maxWidth: 500,
};

const iconRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "var(--text-secondary)",
  lineHeight: 1.7,
};

const saveBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const purgeBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "var(--error)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  transition: "opacity 0.15s ease",
};
