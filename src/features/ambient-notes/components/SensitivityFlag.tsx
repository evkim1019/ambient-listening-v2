import React from "react";
import type { SensitivityDetection } from "../types";

interface SensitivityFlagProps {
  detection: SensitivityDetection;
}

const categoryLabels: Record<SensitivityDetection["category"], string> = {
  substance_abuse: "Substance",
  self_harm: "Self-Harm",
  domestic_violence: "DV",
  legal_sensitive: "Legal",
  end_of_life: "End-of-Life",
  disability_capacity: "Capacity",
};

export const SensitivityFlag: React.FC<SensitivityFlagProps> = ({ detection }) => {
  return (
    <div style={flagStyle}>
      <span style={dotStyle} />
      <span style={categoryStyle}>{categoryLabels[detection.category]}</span>
      <span style={topicStyle}>{detection.topic}</span>
    </div>
  );
};

const flagStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 12px",
  backgroundColor: "rgba(249, 115, 22, 0.1)",
  border: "1px solid rgba(249, 115, 22, 0.25)",
  borderRadius: "var(--radius-full)",
  fontSize: 11,
  fontFamily: "var(--font)",
  whiteSpace: "nowrap",
  backdropFilter: "blur(8px)",
};

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  backgroundColor: "var(--accent)",
  flexShrink: 0,
};

const categoryStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--accent)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const topicStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
};
