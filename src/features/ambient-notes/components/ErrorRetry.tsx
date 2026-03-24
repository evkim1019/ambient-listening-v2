import React from "react";

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
}

export const ErrorRetry: React.FC<ErrorRetryProps> = ({ message, onRetry }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: 24,
        margin: "16px 0",
        backgroundColor: "var(--error-soft)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--error)" }}>
        <span style={{ fontSize: 18 }}>⚠</span>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{message}</p>
      </div>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 20px",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "var(--error)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
      >
        Retry
      </button>
    </div>
  );
};
