import React from "react";

interface ComplianceHighlightProps {
  modifiedText: string;
  originalText: string;
}

const tooltipStyles = `
.compliance-highlight-wrap {
  position: relative;
  display: inline;
}
.compliance-highlight-wrap .compliance-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 12px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 10;
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.compliance-highlight-wrap:hover .compliance-tooltip {
  visibility: visible;
  opacity: 1;
}
`;

export const ComplianceHighlight: React.FC<ComplianceHighlightProps> = ({ modifiedText, originalText }) => {
  return (
    <>
      <style>{tooltipStyles}</style>
      <span className="compliance-highlight-wrap">
        <span
          style={{
            backgroundColor: "var(--accent-soft)",
            borderBottom: "2px solid var(--accent)",
            padding: "1px 3px",
            borderRadius: 3,
            cursor: "default",
            color: "var(--accent)",
            fontWeight: 500,
          }}
        >
          {modifiedText}
        </span>
        <span className="compliance-tooltip">Original: {originalText}</span>
      </span>
    </>
  );
};
