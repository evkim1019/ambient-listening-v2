import React from "react";
import type { DocumentationGap } from "../types";

interface GapItemProps {
  gap: DocumentationGap;
  onAddSuggestion: (gap: DocumentationGap) => void;
}

const severityConfig: Record<DocumentationGap["severity"], { label: string; color: string }> = {
  required_for_billing: { label: "Required", color: "var(--error)" },
  recommended_for_compliance: { label: "Recommended", color: "var(--warning)" },
  suggested_for_completeness: { label: "Suggested", color: "var(--info)" },
};

export const GapItem: React.FC<GapItemProps> = ({ gap, onAddSuggestion }) => {
  const severity = severityConfig[gap.severity];

  return (
    <div style={itemStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ ...tagStyle, color: severity.color, borderColor: severity.color }}>
          {severity.label}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
          {gap.description}
        </span>
      </div>
      <button onClick={() => onAddSuggestion(gap)} style={addBtnStyle}>
        + Add
      </button>
    </div>
  );
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: 8,
  padding: "10px 12px",
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  justifyContent: "space-between"
};

const tagStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  border: "1px solid",
  borderRadius: "var(--radius-full)",
};

const addBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "4px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--accent)",
  backgroundColor: "var(--accent-soft)",
  border: "1px solid rgba(249, 115, 22, 0.2)",
  borderRadius: "var(--radius-full)",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
