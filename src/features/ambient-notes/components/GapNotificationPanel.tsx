import React from "react";
import type { DocumentationGap } from "../types";
import { GapItem } from "./GapItem";

interface GapNotificationPanelProps {
  gaps: DocumentationGap[];
  onAddSuggestion: (gap: DocumentationGap) => void;
}

export const GapNotificationPanel: React.FC<GapNotificationPanelProps> = ({ gaps, onAddSuggestion }) => {
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Documentation Gaps</h3>
        <span style={{
          ...badgeStyle,
          backgroundColor: gaps.length > 0 ? "var(--accent)" : "var(--success)",
        }}>
          {gaps.length}
        </span>
      </div>

      {gaps.length === 0 ? (
        <p style={emptyStyle}>No documentation gaps found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gaps.map((gap) => (
            <GapItem key={gap.id} gap={gap} onAddSuggestion={onAddSuggestion} />
          ))}
        </div>
      )}
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 16,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--text-primary)",
  letterSpacing: "-0.01em",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 20,
  height: 20,
  padding: "0 6px",
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  borderRadius: "var(--radius-full)",
};

const emptyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "var(--success)",
  fontWeight: 500,
};
