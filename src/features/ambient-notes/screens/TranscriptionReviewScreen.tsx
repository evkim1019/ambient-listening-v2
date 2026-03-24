import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { transcribeAudio } from "../services/mockTranscriptionService";
import { scanForComplianceFlags } from "../services/mockComplianceService";
import { generateNote } from "../services/mockNoteGeneratorService";
import { analyzeNoteForGaps } from "../services/mockGapIdentifierService";
import { ComplianceHighlight } from "../components/ComplianceHighlight";
import { RecommendedSentence } from "../components/RecommendedSentence";
import { GapNotificationPanel } from "../components/GapNotificationPanel";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ErrorRetry } from "../components/ErrorRetry";
import { TemplateDropdown } from "../components/TemplateDropdown";
import type { NoteGenerationOptions } from "../services/mockNoteGeneratorService";
import type { ComplianceFlag, DocumentationGap } from "../types";

type ScreenPhase = "transcribing" | "ready" | "generating" | "editing" | "error";

export default function TranscriptionReviewScreen() {
  const navigate = useNavigate();
  const {
    transcription, setTranscription,
    complianceFlags, setComplianceFlags,
    templateEnabled, setTemplateEnabled,
    selectedTemplate, setSelectedTemplate,
    generatedNote, setGeneratedNote,
    editedNoteContent, setEditedNoteContent,
    documentationGaps, setDocumentationGaps,
  } = useAmbientNotes();

  const [phase, setPhase] = useState<ScreenPhase>("transcribing");
  const [errorMessage, setErrorMessage] = useState("");
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ---- Transcription ---- */

  const doTranscribe = useCallback(async () => {
    setPhase("transcribing");
    setErrorMessage("");
    try {
      const result = await transcribeAudio(new Blob(["dummy"]));
      setTranscription(result.text);
      const flags = scanForComplianceFlags(result.text);
      setComplianceFlags(flags);
      setPhase("ready");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Transcription failed.");
      setPhase("error");
    }
  }, [setTranscription, setComplianceFlags]);

  useEffect(() => { doTranscribe(); }, [doTranscribe]);

  /* ---- Compliance flag handlers ---- */

  const handleToggleFlag = useCallback((id: string) => {
    setComplianceFlags(complianceFlags.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  }, [complianceFlags, setComplianceFlags]);

  const handleEditReplacement = useCallback((id: string, newReplacement: string) => {
    setComplianceFlags(complianceFlags.map((f) =>
      f.id === id ? { ...f, replacement: newReplacement } : f
    ));
  }, [complianceFlags, setComplianceFlags]);

  const enabledCount = complianceFlags.filter((f) => f.enabled).length;
  const allEnabled = complianceFlags.length > 0 && enabledCount === complianceFlags.length;

  const handleToggleAll = useCallback(() => {
    const newEnabled = !allEnabled;
    setComplianceFlags(complianceFlags.map((f) => ({ ...f, enabled: newEnabled })));
  }, [allEnabled, complianceFlags, setComplianceFlags]);

  /* ---- Note generation ---- */

  const handleGenerateNote = useCallback(async () => {
    setPhase("generating");
    setErrorMessage("");
    try {
      const options: NoteGenerationOptions = {
        transcription,
        template: selectedTemplate || undefined,
        complianceFlags,
      };
      const result = await generateNote(options);
      setGeneratedNote(result);
      setEditedNoteContent(templateEnabled ? result.content : "");
      setPhase("editing");
      if (templateEnabled && result.content) {
        runGapAnalysis(result.content);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Note generation failed.");
      setPhase("error");
    }
  }, [transcription, selectedTemplate, complianceFlags, templateEnabled, setGeneratedNote, setEditedNoteContent]);

  /* ---- Editor helpers ---- */

  const hasComplianceMappings = complianceFlags.some((f) => f.enabled);

  const flashHighlight = useCallback((start: number, end: number) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightRange({ start, end });
    highlightTimerRef.current = setTimeout(() => setHighlightRange(null), 1500);
  }, []);

  const runGapAnalysis = useCallback(async (content: string) => {
    try {
      const result = await analyzeNoteForGaps(content, selectedTemplate || undefined);
      setDocumentationGaps(result.gaps);
    } catch { setDocumentationGaps([]); }
  }, [selectedTemplate, setDocumentationGaps]);

  const handleContentChange = useCallback((newContent: string) => {
    setEditedNoteContent(newContent);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runGapAnalysis(newContent), 800);
  }, [setEditedNoteContent, runGapAnalysis]);

  const handleAddSuggestion = useCallback((gap: DocumentationGap) => {
    const prefix = editedNoteContent ? editedNoteContent + "\n" : "";
    const insertStart = prefix.length;
    const newContent = prefix + gap.suggestedText;
    setEditedNoteContent(newContent);
    flashHighlight(insertStart, newContent.length);
    setDocumentationGaps(documentationGaps.filter((g) => g.id !== gap.id));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runGapAnalysis(newContent), 800);
  }, [editedNoteContent, setEditedNoteContent, documentationGaps, setDocumentationGaps, runGapAnalysis, flashHighlight]);

  const handleInsertSentence = useCallback((sentence: string) => {
    const prefix = editedNoteContent ? editedNoteContent + " " : "";
    const insertStart = prefix.length;
    const newContent = prefix + sentence;
    handleContentChange(newContent);
    flashHighlight(insertStart, newContent.length);
  }, [editedNoteContent, handleContentChange, flashHighlight]);

  const handleFinalize = () => navigate("/ambient-notes/retention");

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  /* ---- Compliance preview renderer ---- */

  const renderComplianceDraft = () => {
    if (!generatedNote?.complianceMappings || generatedNote.complianceMappings.length === 0) return null;
    const mappings = generatedNote.complianceMappings;
    const parts: React.ReactNode[] = [];
    let remaining = editedNoteContent;
    let keyIdx = 0;
    while (remaining.length > 0) {
      let earliestIndex = -1;
      let earliestMapping: (typeof mappings)[0] | null = null;
      for (const mapping of mappings) {
        const idx = remaining.toLowerCase().indexOf(mapping.replacement.toLowerCase());
        if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
          earliestIndex = idx;
          earliestMapping = mapping;
        }
      }
      if (earliestIndex === -1 || !earliestMapping) { parts.push(<span key={keyIdx++}>{remaining}</span>); break; }
      if (earliestIndex > 0) parts.push(<span key={keyIdx++}>{remaining.substring(0, earliestIndex)}</span>);
      parts.push(
        <ComplianceHighlight key={keyIdx++}
          modifiedText={remaining.substring(earliestIndex, earliestIndex + earliestMapping.replacement.length)}
          originalText={earliestMapping.original} />
      );
      remaining = remaining.substring(earliestIndex + earliestMapping.replacement.length);
    }
    return (
      <div style={complianceDraftStyle}>
        <div style={complianceLabelStyle}>Compliance Preview</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{parts}</div>
      </div>
    );
  };

  /* ---- Highlight overlay renderer ---- */

  const renderHighlightedEditor = () => {
    if (!highlightRange) return null;
    const before = editedNoteContent.substring(0, highlightRange.start);
    const highlighted = editedNoteContent.substring(highlightRange.start, highlightRange.end);
    const after = editedNoteContent.substring(highlightRange.end);
    return (
      <div style={highlightOverlayStyle} aria-hidden="true">
        <span style={{ visibility: "hidden", whiteSpace: "pre-wrap" }}>{before}</span>
        <span style={highlightedTextStyle}>{highlighted}</span>
        <span style={{ visibility: "hidden", whiteSpace: "pre-wrap" }}>{after}</span>
      </div>
    );
  };

  /* ---- Loading / error states ---- */

  if (phase === "transcribing") {
    return <div style={centeredStyle}><LoadingIndicator message="Transcribing audio..." /></div>;
  }
  if (phase === "generating") {
    return <div style={centeredStyle}><LoadingIndicator message="Generating clinical note..." /></div>;
  }
  if (phase === "error") {
    return (
      <div style={centeredStyle}>
        <ErrorRetry message={errorMessage} onRetry={errorMessage.includes("Transcription") ? doTranscribe : handleGenerateNote} />
      </div>
    );
  }

  /* ---- Right panel: config (ready) or editor (editing) ---- */

  const renderRightPanel = () => {
    if (phase === "editing") {
      return renderEditorPanel();
    }
    return renderConfigPanel();
  };

  const renderConfigPanel = () => (
    <>
      {/* Flagged Terms */}
      {complianceFlags.length > 0 && (
        <div style={flagsSectionStyle}>
          <div style={flagsHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={labelStyle}>Flagged Terms</div>
              <span style={badgeStyle}>{enabledCount}/{complianceFlags.length}</span>
            </div>
            <label style={masterCheckboxStyle}>
              <input type="checkbox" checked={allEnabled} onChange={handleToggleAll}
                style={{ width: 14, height: 14, accentColor: "var(--accent)", cursor: "pointer" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>All</span>
            </label>
          </div>
          <div style={flagsListStyle}>
            {complianceFlags.map((flag) => (
              <FlagItem key={flag.id} flag={flag} onToggle={handleToggleFlag} onEditReplacement={handleEditReplacement} />
            ))}
          </div>
        </div>
      )}

      {/* Template & Options */}
      <div style={controlsSectionStyle}>
        <div style={sectionStyle}>
          <div style={labelStyle}>Template</div>
          <TemplateDropdown value={selectedTemplate} onChange={setSelectedTemplate} />
        </div>
        <div style={sectionStyle}>
          <ToggleSwitch label="Start with pre-written note" checked={templateEnabled} onChange={setTemplateEnabled} />
          <p style={hintStyle}>Notes that are generated by AI can be denied by insurance company</p>
        </div>
        <button onClick={handleGenerateNote} style={generateBtnStyle}>Generate Note</button>
      </div>
    </>
  );

  const renderEditorPanel = () => {
    if (templateEnabled) {
      /* Template mode: compliance preview + textarea */
      return (
        <div style={editorPanelStyle}>
          <div style={labelStyle}>Clinical Note</div>
          {hasComplianceMappings && renderComplianceDraft()}
          <textarea ref={textareaRef} value={editedNoteContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Edit your clinical note..." style={textareaStyle} rows={18} />
          <button onClick={handleFinalize} style={finalizeBtnStyle}>Finalize Note</button>
        </div>
      );
    }

    /* Blank mode: textarea + recommendations, gap panel below */
    return (
      <div style={editorPanelStyle}>
        <div style={labelStyle}>Compose Note</div>
        <div style={editorWrapperStyle}>
          {renderHighlightedEditor()}
          <textarea ref={textareaRef} value={editedNoteContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing your clinical note..." style={textareaStyle} rows={14} />
        </div>

        {generatedNote?.recommendedSentences && generatedNote.recommendedSentences.length > 0 && (
          <div style={recsContainerStyle}>
            <div style={recsLabelStyle}>Recommended Sentences</div>
            <div style={recsListStyle}>
              {generatedNote.recommendedSentences.map((sentence, idx) => (
                <RecommendedSentence key={idx} sentence={sentence} onInsert={handleInsertSentence} />
              ))}
            </div>
            {hasComplianceMappings && generatedNote.complianceMappings && generatedNote.complianceMappings.length > 0 && (
              <p style={{ margin: 0, fontSize: 11, color: "var(--warning)", fontStyle: "italic" }}>
                Compliance modifications applied to sentences.
              </p>
            )}
          </div>
        )}

        <div style={gapPanelWrapperStyle}>
          <GapNotificationPanel gaps={documentationGaps} onAddSuggestion={handleAddSuggestion} />
        </div>

        <button onClick={handleFinalize} style={finalizeBtnStyle}>Finalize Note</button>
      </div>
    );
  };

  /* ---- Main render ---- */

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>{phase === "editing" ? "Review & Edit Note" : "Review Transcription"}</h2>
        <p style={subStyle}>
          {phase === "editing"
            ? "Edit your note while referencing the original transcription on the left."
            : "Verify the transcription, review flagged terms, and configure note generation."}
        </p>
      </div>

      <div style={twoColumnStyle}>
        {/* LEFT: Transcription — always visible */}
        <div style={leftColumnStyle}>
          <div style={labelStyle}>Transcription</div>
          <div style={transcriptionBoxStyle}>{transcription}</div>
        </div>

        {/* RIGHT: Config or Editor */}
        <div style={rightColumnStyle}>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}


/* ---------- FlagItem ---------- */

function FlagItem({
  flag, onToggle, onEditReplacement,
}: {
  flag: ComplianceFlag;
  onToggle: (id: string) => void;
  onEditReplacement: (id: string, value: string) => void;
}) {
  return (
    <div style={{
      ...flagItemStyle,
      opacity: flag.enabled ? 1 : 0.5,
      borderColor: flag.enabled ? "var(--accent)" : "var(--border)",
    }}>
      <div style={flagTopRowStyle}>
        <input type="checkbox" checked={flag.enabled} onChange={() => onToggle(flag.id)}
          style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }} />
        <span style={flagOriginalStyle}>"{flag.original}"</span>
      </div>
      <div style={flagReplacementRowStyle}>
        <span style={arrowStyle}>→</span>
        <input type="text" value={flag.replacement}
          onChange={(e) => onEditReplacement(flag.id, e.target.value)}
          disabled={!flag.enabled}
          style={{ ...replacementInputStyle, color: flag.enabled ? "var(--text-primary)" : "var(--text-muted)" }} />
      </div>
    </div>
  );
}

/* ---------- ToggleSwitch ---------- */

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={toggleRowStyle}>
      <span role="switch" aria-checked={checked} tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(!checked); } }}
        style={{ ...trackStyle, backgroundColor: checked ? "var(--accent)" : "var(--bg-input)" }}>
        <span style={{ ...thumbStyle, transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
      </span>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
    </label>
  );
}

/* ---------- Styles ---------- */

const centeredStyle: React.CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "48px 24px" };

const pageStyle: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "40px 24px" };

const headerStyle: React.CSSProperties = { marginBottom: 28 };

const headingStyle: React.CSSProperties = {
  fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em",
};

const subStyle: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)", margin: "6px 0 0" };

const hintStyle: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0", fontStyle: "italic" };

const twoColumnStyle: React.CSSProperties = { display: "flex", gap: 32, alignItems: "flex-start" };

const leftColumnStyle: React.CSSProperties = {
  flex: "1 1 45%", minWidth: 0, display: "flex", flexDirection: "column", gap: 8,
  position: "sticky", top: 24,
};

const rightColumnStyle: React.CSSProperties = {
  flex: "1 1 55%", minWidth: 300, display: "flex", flexDirection: "column", gap: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)",
};

const badgeStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "var(--accent)", backgroundColor: "var(--accent-soft)",
  padding: "2px 8px", borderRadius: "var(--radius-full)",
};

const transcriptionBoxStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap", padding: 20, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)",
  maxHeight: "70vh", overflowY: "auto",
};

const flagsSectionStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 10,
  padding: 16, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};

const flagsHeaderStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
};

const masterCheckboxStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
};

const flagsListStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 6, maxHeight: "40vh", overflowY: "auto",
};

const flagItemStyle: React.CSSProperties = {
  padding: "10px 12px", backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", transition: "opacity 0.15s ease, border-color 0.15s ease",
};

const flagTopRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };

const flagOriginalStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--accent)" };

const flagReplacementRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginLeft: 23,
};

const arrowStyle: React.CSSProperties = { fontSize: 12, color: "var(--text-muted)", flexShrink: 0 };

const replacementInputStyle: React.CSSProperties = {
  flex: 1, padding: "5px 8px", fontSize: 12, fontFamily: "var(--font)",
  backgroundColor: "var(--bg-input)", border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-sm)", outline: "none", transition: "border-color 0.15s ease",
};

const controlsSectionStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 16,
  padding: 16, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};

const sectionStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10 };

const toggleRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, cursor: "pointer" };

const trackStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", width: 40, height: 22, borderRadius: 11,
  transition: "background-color 0.2s", flexShrink: 0, cursor: "pointer", border: "1px solid var(--border-light)",
};

const thumbStyle: React.CSSProperties = {
  width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "transform 0.2s",
};

const generateBtnStyle: React.CSSProperties = {
  padding: "12px 32px", fontSize: 14, fontWeight: 700, color: "#fff",
  backgroundColor: "var(--accent)", border: "none", borderRadius: "var(--radius-md)",
  cursor: "pointer", width: "100%", boxShadow: "0 4px 16px rgba(249,115,22,0.2)",
  transition: "box-shadow 0.2s ease", letterSpacing: "-0.01em",
};

const editorPanelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 16,
};

const editorWrapperStyle: React.CSSProperties = { position: "relative" };

const textareaStyle: React.CSSProperties = {
  width: "100%", padding: 20, fontSize: 14, lineHeight: 1.7, fontFamily: "var(--font)",
  color: "var(--text-primary)", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", resize: "vertical", boxSizing: "border-box",
  outline: "none", transition: "border-color 0.15s ease",
};

const highlightOverlayStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, right: 0, padding: 20,
  fontSize: 14, lineHeight: 1.7, fontFamily: "var(--font)",
  pointerEvents: "none", zIndex: 2, whiteSpace: "pre-wrap", wordWrap: "break-word", overflow: "hidden",
};

const highlightedTextStyle: React.CSSProperties = {
  backgroundColor: "rgba(249, 115, 22, 0.25)", borderRadius: 3, transition: "background-color 0.3s ease",
};

const complianceDraftStyle: React.CSSProperties = {
  padding: 20, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderLeft: "3px solid var(--accent)", borderRadius: "var(--radius-md)",
  maxHeight: 300, overflowY: "auto",
};

const complianceLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--accent)", marginBottom: 10,
};

const recsContainerStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 10,
};

const recsLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)",
};

const recsListStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 6,
};

const gapPanelWrapperStyle: React.CSSProperties = {
  maxHeight: "40vh", overflowY: "auto",
};

const finalizeBtnStyle: React.CSSProperties = {
  padding: "14px 32px", fontSize: 14, fontWeight: 700, color: "#fff",
  backgroundColor: "var(--accent)", border: "none", borderRadius: "var(--radius-md)",
  cursor: "pointer", width: "100%", boxShadow: "0 4px 16px rgba(249,115,22,0.2)",
  transition: "box-shadow 0.2s ease", letterSpacing: "-0.01em",
};
