import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulsingCircle } from "../components/PulsingCircle";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { storeInBuffer } from "../services/volatileAudioBuffer";

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function ActiveListeningScreen() {
  const navigate = useNavigate();
  const { setIsListening, setIsPaused: setContextPaused } = useAmbientNotes();

  const [paused, setPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  useEffect(() => {
    setIsListening(true);
    setContextPaused(false);
    return () => { setIsListening(false); };
  }, [setIsListening, setContextPaused]);

  const handlePause = useCallback(() => {
    setPaused(true);
    setContextPaused(true);
  }, [setContextPaused]);

  const handleResume = useCallback(() => {
    setPaused(false);
    setContextPaused(false);
  }, [setContextPaused]);

  const handleCompleted = useCallback(() => {
    setIsListening(false);
    storeInBuffer(new Blob(["dummy-audio"]), "");
    navigate("/ambient-notes/review");
  }, [navigate, setIsListening]);

  return (
    <div style={pageStyle}>
      <div style={statusLabelStyle}>{paused ? "Paused" : "Listening"}</div>
      <PulsingCircle active={!paused} />
      <div style={timerStyle}>{formatTime(elapsedSeconds)}</div>
      <div style={{ display: "flex", gap: 12 }}>
        {paused ? (
          <button onClick={handleResume} style={resumeBtnStyle}>Resume</button>
        ) : (
          <button onClick={handlePause} style={pauseBtnStyle}>Pause</button>
        )}
        <button onClick={handleCompleted} style={completedBtnStyle}>Completed</button>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "48px 24px",
  gap: 16,
  minHeight: "80vh",
};

const statusLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-muted)",
};

const timerStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 800,
  color: "var(--text-primary)",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "-0.02em",
};

const btnBase: React.CSSProperties = {
  padding: "12px 36px",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  letterSpacing: "-0.01em",
};

const pauseBtnStyle: React.CSSProperties = {
  ...btnBase,
  color: "var(--text-primary)",
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border-light)",
};

const resumeBtnStyle: React.CSSProperties = {
  ...btnBase,
  color: "#fff",
  backgroundColor: "var(--success)",
};

const completedBtnStyle: React.CSSProperties = {
  ...btnBase,
  color: "#fff",
  backgroundColor: "var(--accent)",
  boxShadow: "0 4px 16px rgba(249,115,22,0.2)",
};
