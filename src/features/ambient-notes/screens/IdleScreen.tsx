import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorRetry } from "../components/ErrorRetry";
import { LoadingIndicator } from "../components/LoadingIndicator";

export default function IdleScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      navigate("/ambient-notes/listen");
    } catch {
      setError("Microphone permission is required to start ambient listening.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Requesting microphone access…" />;
  }

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <div style={logoMarkStyle}>
          <div style={dotStyle} />
          <div style={dotStyle2} />
        </div>
        <h1 style={titleStyle}>Ambient Clinical Notes</h1>
        <p style={subtitleStyle}>
          AI-powered documentation that listens, drafts, and protects.
        </p>

        {error && <ErrorRetry message={error} onRetry={handleStart} />}

        {!error && (
          <button onClick={handleStart} style={startBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(249,115,22,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(249,115,22,0.25)"; }}
          >
            Start Listening
          </button>
        )}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
  padding: "32px 24px",
};

const heroStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 24,
  textAlign: "center",
  maxWidth: 480,
};

const logoMarkStyle: React.CSSProperties = {
  position: "relative",
  width: 48,
  height: 48,
};

const dotStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 8,
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "var(--accent)",
  opacity: 0.8,
};

const dotStyle2: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: "var(--accent)",
  opacity: 0.4,
};

const titleStyle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 800,
  color: "var(--text-primary)",
  margin: 0,
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 16,
  color: "var(--text-muted)",
  margin: 0,
  lineHeight: 1.5,
};

const startBtnStyle: React.CSSProperties = {
  padding: "16px 48px",
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
  backgroundColor: "var(--accent)",
  border: "none",
  borderRadius: "var(--radius-lg)",
  cursor: "pointer",
  boxShadow: "0 8px 32px rgba(249,115,22,0.25)",
  transition: "box-shadow 0.3s ease, transform 0.15s ease",
  letterSpacing: "-0.01em",
};
