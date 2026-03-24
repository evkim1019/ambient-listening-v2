import { useNavigate } from "react-router-dom";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { AttestationForm } from "../components/AttestationForm";

export default function AttestationScreen() {
  const navigate = useNavigate();
  const { editedNoteContent, setAttestationCompleted, setAttestationTimestamp } = useAmbientNotes();

  const handleAttest = (timestamp: string) => {
    setAttestationCompleted(true);
    setAttestationTimestamp(timestamp);
    navigate("/ambient-notes/export");
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Clinician Attestation</h2>
        <p style={subStyle}>Review the finalized note and attest that it accurately represents the encounter.</p>
      </div>

      <div style={notePreviewStyle}>
        <div style={labelStyle}>Finalized Note</div>
        <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
          {editedNoteContent || "No note content available."}
        </div>
      </div>

      <AttestationForm onAttest={handleAttest} />
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
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  marginBottom: 10,
};

const notePreviewStyle: React.CSSProperties = {
  padding: 20,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  marginBottom: 24,
  maxHeight: 400,
  overflowY: "auto",
};
