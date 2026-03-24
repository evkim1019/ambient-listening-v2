import { useNavigate } from "react-router-dom";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { purgeBuffer } from "../services/volatileAudioBuffer";
import { DataRetentionPrompt } from "../components/DataRetentionPrompt";

export default function DataRetentionScreen() {
  const navigate = useNavigate();
  const { setDataRetentionConfirmed } = useAmbientNotes();

  const handleConfirmSave = () => {
    setDataRetentionConfirmed(true);
    navigate("/ambient-notes/attestation");
  };

  const handleDeclinePurge = () => {
    purgeBuffer();
    setDataRetentionConfirmed(false);
    navigate("/ambient-notes/attestation");
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Data Retention</h2>
        <p style={subStyle}>
          Decide whether to retain the raw audio and transcription data from this session.
        </p>
      </div>
      <DataRetentionPrompt onConfirmSave={handleConfirmSave} onDeclinePurge={handleDeclinePurge} />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "40px 24px",
};

const headerStyle: React.CSSProperties = { marginBottom: 28 };

const headingStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "var(--text-primary)",
  margin: 0,
  letterSpacing: "-0.03em",
};

const subStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--text-muted)",
  margin: "6px 0 0",
  lineHeight: 1.6,
};
