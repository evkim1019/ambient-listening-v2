import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

const spinnerKeyframes = `
@keyframes ambient-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 20 }}>
      <style>{spinnerKeyframes}</style>
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
          animation: "ambient-spin 0.7s linear infinite",
        }}
      />
      {message && (
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", letterSpacing: "0.01em" }}>
          {message}
        </p>
      )}
    </div>
  );
};
