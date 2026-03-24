import React, { useState } from "react";

interface AttestationFormProps {
  onAttest: (timestamp: string) => void;
}

export const AttestationForm: React.FC<AttestationFormProps> = ({ onAttest }) => {
  const [checked, setChecked] = useState(false);

  const handleSign = () => {
    if (checked) {
      onAttest(new Date().toISOString());
    }
  };

  return (
    <div style={cardStyle}>
      <p style={bodyStyle}>
        I attest that this clinical note accurately represents the patient encounter and is my own work product.
      </p>

      <label style={checkboxRow}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer" }}
        />
        <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>I confirm the above attestation</span>
      </label>

      <button
        onClick={handleSign}
        disabled={!checked}
        style={{
          ...signBtnStyle,
          backgroundColor: checked ? "var(--accent)" : "var(--bg-elevated)",
          color: checked ? "#fff" : "var(--text-muted)",
          cursor: checked ? "pointer" : "not-allowed",
        }}
      >
        Sign and Proceed
      </button>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: 24,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "var(--text-secondary)",
  lineHeight: 1.7,
};

const checkboxRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
};

const signBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "10px 24px",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  borderRadius: "var(--radius-sm)",
  transition: "all 0.2s ease",
};
