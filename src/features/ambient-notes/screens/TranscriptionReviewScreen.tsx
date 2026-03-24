import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAmbientNotes } from "../context/AmbientNotesContext";
import { transcribeAudio, KEY_TAKEAWAY_PHRASES } from "../services/mockTranscriptionService";
import { scanForComplianceFlags, scanNoteForLegalFlags } from "../services/mockComplianceService";
import { generateNote } from "../services/mockNoteGeneratorService";
import type { NoteGenerationOptions } from "../services/mockNoteGeneratorService";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { ErrorRetry } from "../components/ErrorRetry";
import { TEMPLATE_SECTIONS } from "../data/templates";
import { purgeBuffer } from "../services/volatileAudioBuffer";
import type { ComplianceFlag, TemplateName } from "../types";

/* ---- Insurance coverage recommendation items based on EHR audit checklist ---- */
const COVERAGE_RECOMMENDATIONS = [
  { id: "cc", label: "Chief Complaint", text: "Chief Complaint: [Document patient's primary reason for visit in their own words]", keywords: ["chief complaint", "reason for visit", "presenting concern"] },
  { id: "hpi", label: "History of Present Illness", text: "HPI: Onset, location, duration, character, aggravating/relieving factors, timing, and severity documented.", keywords: ["history of present illness", "hpi:", "onset", "duration", "aggravating"] },
  { id: "ros", label: "Review of Systems", text: "ROS: Constitutional, psychiatric, neurological systems reviewed. Pertinent negatives documented.", keywords: ["review of systems", "ros:", "pertinent negatives", "denies dyspnea", "denies chest pain"] },
  { id: "pe", label: "Physical Examination", text: "Physical Exam: Vital signs recorded. System-specific findings with pertinent negatives noted.", keywords: ["physical exam", "vital signs", "bp ", "hr ", "temp ", "physical examination"] },
  { id: "mdm", label: "Medical Decision Making", text: "MDM: Number of diagnoses/management options, data reviewed, and risk of complications documented.", keywords: ["medical decision making", "mdm:", "differential diagnos", "risk of complications"] },
  { id: "dx", label: "Diagnosis with ICD-10", text: "Assessment: [Primary diagnosis] — ICD-10: [code]. Differential diagnoses considered.", keywords: ["icd-10", "icd10", "diagnosis:", "assessment:"] },
  { id: "plan", label: "Treatment Plan", text: "Plan: Medications prescribed, dosage, frequency. Referrals ordered. Follow-up scheduled in [X] weeks.", keywords: ["plan:", "medications prescribed", "referrals ordered", "follow-up scheduled"] },
  { id: "time", label: "Time Documentation", text: "Total face-to-face time: [X] minutes. Counseling/coordination comprised >50% of encounter.", keywords: ["face-to-face time", "total time", "minutes spent", "counseling/coordination"] },
  { id: "consent", label: "Informed Consent", text: "Risks, benefits, and alternatives discussed. Patient verbalized understanding and consented to treatment plan.", keywords: ["informed consent", "risks, benefits", "consented to", "verbalized understanding"] },
  { id: "safety", label: "Safety Assessment", text: "Safety assessment completed. Patient denies SI/HI. Safety plan reviewed and updated.", keywords: ["safety assessment", "safety plan", "denies si", "denies hi", "suicidal ideation"] },
];

type ScreenPhase = "transcribing" | "ready" | "error";

export default function TranscriptionReviewScreen() {
  const navigate = useNavigate();
  const {
    transcription, setTranscription,
    complianceFlags, setComplianceFlags,
    selectedTemplate, setSelectedTemplate,
    setGeneratedNote, setEditedNoteContent,
    setDataRetentionConfirmed,
    setAttestationCompleted, setAttestationTimestamp,
  } = useAmbientNotes();

  const [phase, setPhase] = useState<ScreenPhase>("transcribing");
  const [errorMessage, setErrorMessage] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedSinceEdit, setHasGeneratedSinceEdit] = useState(false);
  const [legalReviewEnabled, setLegalReviewEnabled] = useState(true);
  const [coverageRecsEnabled, setCoverageRecsEnabled] = useState(false);
  const [noteLegalFlags, setNoteLegalFlags] = useState<ComplianceFlag[]>([]);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [purgeData, setPurgeData] = useState(true);
  const [attestChecked, setAttestChecked] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const legalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /* ---- Close template menu on outside click ---- */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setShowTemplateMenu(false);
      }
    };
    if (showTemplateMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplateMenu]);

  /* ---- Transcript rendering with clinical key points ---- */

  const renderTranscript = useMemo(() => {
    if (!transcription) return null;
    type HRange = { start: number; end: number };
    const ranges: HRange[] = [];
    const lowerText = transcription.toLowerCase();
    for (const phrase of KEY_TAKEAWAY_PHRASES) {
      let from = 0;
      const lp = phrase.toLowerCase();
      while (true) {
        const idx = lowerText.indexOf(lp, from);
        if (idx === -1) break;
        ranges.push({ start: idx, end: idx + phrase.length });
        from = idx + phrase.length;
      }
    }
    ranges.sort((a, b) => a.start - b.start);
    // Merge overlapping
    const merged: HRange[] = [];
    for (const r of ranges) {
      if (merged.length > 0 && r.start <= merged[merged.length - 1].end) {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end);
      } else {
        merged.push({ ...r });
      }
    }
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    for (let i = 0; i < merged.length; i++) {
      const r = merged[i];
      if (cursor < r.start) nodes.push(<span key={`t-${cursor}`}>{transcription.substring(cursor, r.start)}</span>);
      nodes.push(<span key={`h-${i}`} style={takeawayHighlightStyle}>{transcription.substring(r.start, r.end)}</span>);
      cursor = r.end;
    }
    if (cursor < transcription.length) nodes.push(<span key={`t-${cursor}`}>{transcription.substring(cursor)}</span>);
    return nodes;
  }, [transcription]);

  /* ---- Add AI note ---- */

  const handleSelectTemplateAndGenerate = useCallback(async (template: TemplateName) => {
    setSelectedTemplate(template);
    setShowTemplateMenu(false);
    setIsGenerating(true);
    setErrorMessage("");
    try {
      const options: NoteGenerationOptions = { transcription, template, complianceFlags };
      const result = await generateNote(options);
      setGeneratedNote(result);
      const newContent = noteContent ? noteContent + "\n\n" + result.content : result.content;
      setNoteContent(newContent);
      setEditedNoteContent(newContent);
      setHasGeneratedSinceEdit(true);
      setCoverageRecsEnabled(true);
      // Trigger immediate legal scan on the new content
      if (legalReviewEnabled) {
        setNoteLegalFlags(scanNoteForLegalFlags(newContent));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Note generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }, [transcription, complianceFlags, noteContent, setSelectedTemplate, setGeneratedNote, setEditedNoteContent]);

  const canAddAINote = !isGenerating && !hasGeneratedSinceEdit;

  /* ---- Note content change ---- */

  const handleNoteChange = useCallback((value: string) => {
    setNoteContent(value);
    setEditedNoteContent(value);
    setHasGeneratedSinceEdit(false);
    if (legalReviewEnabled) {
      if (legalDebounceRef.current) clearTimeout(legalDebounceRef.current);
      legalDebounceRef.current = setTimeout(() => setNoteLegalFlags(scanNoteForLegalFlags(value)), 500);
    }
  }, [setEditedNoteContent, legalReviewEnabled]);

  /* ---- Toggle legal review ---- */

  const handleToggleLegalReview = useCallback((enabled: boolean) => {
    setLegalReviewEnabled(enabled);
    if (enabled && noteContent) setNoteLegalFlags(scanNoteForLegalFlags(noteContent));
    else if (!enabled) setNoteLegalFlags([]);
  }, [noteContent]);

  /* ---- Accept legal suggestion ---- */

  const handleAcceptLegalSuggestion = useCallback((flag: ComplianceFlag) => {
    const regex = new RegExp(escapeRegExpLocal(flag.original), "gi");
    const updated = noteContent.replace(regex, flag.replacement);
    setNoteContent(updated);
    setEditedNoteContent(updated);
    setNoteLegalFlags(scanNoteForLegalFlags(updated));
  }, [noteContent, setEditedNoteContent]);

  /* ---- Add coverage recommendation ---- */

  const handleAddCoverageRec = useCallback((text: string) => {
    const newContent = noteContent ? noteContent + "\n\n" + text : text;
    setNoteContent(newContent);
    setEditedNoteContent(newContent);
    setHasGeneratedSinceEdit(false);
  }, [noteContent, setEditedNoteContent]);

  /* ---- Finalize modal ---- */

  const handleFinalize = () => setShowFinalizeModal(true);

  const handleConfirmFinalize = () => {
    if (purgeData) {
      purgeBuffer();
      setDataRetentionConfirmed(false);
    } else {
      setDataRetentionConfirmed(true);
    }
    setAttestationCompleted(true);
    setAttestationTimestamp(new Date().toISOString());
    setShowFinalizeModal(false);
    navigate("/ambient-notes/export");
  };

  useEffect(() => {
    return () => { if (legalDebounceRef.current) clearTimeout(legalDebounceRef.current); };
  }, []);

  /* ---- Loading / error states ---- */

  if (phase === "transcribing") return <div style={centeredStyle}><LoadingIndicator message="Transcribing audio..." /></div>;
  if (phase === "error" && !noteContent) return <div style={centeredStyle}><ErrorRetry message={errorMessage} onRetry={doTranscribe} /></div>;

  /* ---- Main render ---- */

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Review & Document</h2>
        <p style={subStyle}>Reference the transcription while composing your patient note.</p>
      </div>

      <div style={twoColumnStyle}>
        {/* LEFT: Transcription */}
        <div style={leftColumnStyle}>
          <div style={panelHeaderStyle}>
            <div style={labelStyle}>Transcription</div>
            <div style={legendStyle}>
              <span style={legendDotTakeaway} /> Key points
            </div>
          </div>
          <div style={transcriptionBoxStyle}>{renderTranscript}</div>
        </div>

        {/* RIGHT: Patient Note */}
        <div style={rightColumnStyle}>
          <div style={panelHeaderStyle}>
            <div style={sectionTitleStyle}>Patient Note</div>
          </div>

          {/* Add AI note button with template dropdown */}
          <div style={{ position: "relative" }} ref={templateMenuRef}>
            <button
              onClick={() => { if (canAddAINote) setShowTemplateMenu(!showTemplateMenu); }}
              disabled={!canAddAINote}
              style={{ ...addNoteBtnStyle, opacity: canAddAINote ? 1 : 0.4, cursor: canAddAINote ? "pointer" : "not-allowed" }}>
              {isGenerating ? "Generating..." : "+ Add AI Note"}
              {!isGenerating && <span style={chevronStyle}>▾</span>}
            </button>
            {showTemplateMenu && (
              <div style={templateMenuStyle}>
                {(Object.keys(TEMPLATE_SECTIONS) as TemplateName[]).map((name) => (
                  <button key={name} onClick={() => handleSelectTemplateAndGenerate(name)}
                    style={{
                      ...templateMenuItemStyle,
                      backgroundColor: name === selectedTemplate ? "var(--accent-soft)" : "transparent",
                      color: name === selectedTemplate ? "var(--accent)" : "var(--text-secondary)",
                    }}>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {!canAddAINote && !isGenerating && (
            <p style={hintStyle}>Edit the note to add another AI-generated section.</p>
          )}

          {/* Note textarea + coverage recs inside */}
          <div style={noteAreaWrapperStyle}>
            <textarea value={noteContent}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Start writing or add an AI-generated note above..."
              style={textareaStyle} rows={16} />

            {/* Coverage recommendations inside bottom of textarea area */}
            {coverageRecsEnabled && (() => {
              const lowerNote = noteContent.toLowerCase();
              const visible = COVERAGE_RECOMMENDATIONS.filter(
                (rec) => !rec.keywords.some((kw) => lowerNote.includes(kw))
              );
              if (visible.length === 0) return (
                <div style={coverageRecsInsideStyle}>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--success)", fontWeight: 500 }}>✓ Looking good — all key coverage areas are addressed in this note.</p>
                </div>
              );
              return (
                <div style={coverageRecsInsideStyle}>
                  <div style={coverageRecsLabelStyle}>Insurance Coverage Recommendations</div>
                  <div style={coverageRecsListStyle}>
                    {visible.map((rec) => (
                      <button key={rec.id} onClick={() => handleAddCoverageRec(rec.text)} style={coverageRecBtnStyle}>
                        + {rec.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Toggles section */}
          <div style={togglesSectionStyle}>
            <ToggleSwitch label="Live Legal Review" checked={legalReviewEnabled} onChange={handleToggleLegalReview} />
            {legalReviewEnabled && noteLegalFlags.length > 0 && (
              <div style={legalSuggestionsStyle}>
                {noteLegalFlags.map((flag) => (
                  <LegalSuggestionItem key={flag.id} flag={flag} onAccept={handleAcceptLegalSuggestion} />
                ))}
              </div>
            )}
            {legalReviewEnabled && noteLegalFlags.length === 0 && noteContent.length > 0 && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--success)" }}>No legal concerns detected.</p>
            )}

            <div style={toggleDividerStyle} />

            <ToggleSwitch label="AI Recommendations for Insurance Coverage" checked={coverageRecsEnabled} onChange={setCoverageRecsEnabled} />
          </div>

          {errorMessage && <p style={{ margin: 0, fontSize: 13, color: "var(--error)" }}>{errorMessage}</p>}

          <button onClick={handleFinalize} disabled={!noteContent.trim()}
            style={{ ...finalizeBtnStyle, opacity: noteContent.trim() ? 1 : 0.4, cursor: noteContent.trim() ? "pointer" : "not-allowed" }}>
            Finalize Note
          </button>
        </div>
      </div>

      {/* Finalize Modal: Data Retention + Attestation */}
      {showFinalizeModal && (
        <div style={modalOverlayStyle} onClick={() => setShowFinalizeModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>Finalize & Submit</h3>

            <div style={modalSectionStyle}>
              <div style={modalSectionLabelStyle}>🔒 Data Retention</div>
              <p style={modalBodyStyle}>
                Raw audio and transcription data is held in volatile memory. Choose whether to retain or purge it.
              </p>
              <label style={modalCheckboxRowStyle}>
                <input type="checkbox" checked={purgeData} onChange={(e) => setPurgeData(e.target.checked)}
                  style={modalCheckboxStyle} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Purge raw audio and transcription data</span>
              </label>
            </div>

            <div style={modalDividerStyle} />

            <div style={modalSectionStyle}>
              <div style={modalSectionLabelStyle}>✍️ Clinician Attestation</div>
              <p style={modalBodyStyle}>
                I attest that this clinical note accurately represents the patient encounter and is my own work product.
              </p>
              <label style={modalCheckboxRowStyle}>
                <input type="checkbox" checked={attestChecked} onChange={(e) => setAttestChecked(e.target.checked)}
                  style={modalCheckboxStyle} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>I confirm the above attestation</span>
              </label>
            </div>

            <button onClick={handleConfirmFinalize} disabled={!attestChecked}
              style={{
                ...modalSubmitBtnStyle,
                opacity: attestChecked ? 1 : 0.4,
                cursor: attestChecked ? "pointer" : "not-allowed",
              }}>
              Sign & Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ---------- LegalSuggestionItem ---------- */

function LegalSuggestionItem({ flag, onAccept }: { flag: ComplianceFlag; onAccept: (flag: ComplianceFlag) => void }) {
  return (
    <div style={legalItemStyle}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 12, color: "var(--warning)", fontWeight: 600 }}>"{flag.original}"</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 6px" }}>→</span>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{flag.replacement}</span>
      </div>
      <button onClick={() => onAccept(flag)} style={acceptBtnStyle}>Accept</button>
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
        style={{ ...trackStyle, backgroundColor: checked ? "var(--accent)" : "var(--border-light)" }}>
        <span style={{ ...thumbStyle, transform: checked ? "translateX(18px)" : "translateX(2px)" }} />
      </span>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
    </label>
  );
}

/* ---------- Helpers ---------- */

function escapeRegExpLocal(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------- Styles ---------- */

const centeredStyle: React.CSSProperties = { maxWidth: 720, margin: "0 auto", padding: "48px 24px" };
const pageStyle: React.CSSProperties = { maxWidth: 1280, margin: "0 auto", padding: "32px 24px" };
const headerStyle: React.CSSProperties = { marginBottom: 24 };
const headingStyle: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" };
const subStyle: React.CSSProperties = { fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" };
const hintStyle: React.CSSProperties = { fontSize: 11, color: "var(--text-muted)", margin: 0, fontStyle: "italic" };
const twoColumnStyle: React.CSSProperties = { display: "flex", gap: 28, alignItems: "flex-start" };
const leftColumnStyle: React.CSSProperties = { flex: "1 1 48%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 24 };
const rightColumnStyle: React.CSSProperties = { flex: "1 1 52%", minWidth: 320, display: "flex", flexDirection: "column", gap: 14 };
const panelHeaderStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between" };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" };
const sectionTitleStyle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" };
const legendStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-muted)" };
const legendDotTakeaway: React.CSSProperties = { display: "inline-block", width: 8, height: 8, borderRadius: 2, backgroundColor: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.3)" };

const transcriptionBoxStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap", padding: 18, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", fontSize: 13, lineHeight: 1.8, color: "var(--text-secondary)",
  maxHeight: "75vh", overflowY: "auto", boxShadow: "var(--shadow-sm)",
};

const takeawayHighlightStyle: React.CSSProperties = {
  backgroundColor: "rgba(249, 115, 22, 0.1)", borderRadius: 3, padding: "1px 2px",
  fontWeight: 500, color: "var(--text-primary)",
};

const addNoteBtnStyle: React.CSSProperties = {
  padding: "10px 20px", fontSize: 13, fontWeight: 700, color: "#fff",
  backgroundColor: "var(--accent)", border: "none", borderRadius: "var(--radius-md)",
  whiteSpace: "nowrap", boxShadow: "var(--shadow-sm)", transition: "all 0.15s ease",
  display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center",
};
const chevronStyle: React.CSSProperties = { fontSize: 10, marginLeft: 2, opacity: 0.8 };
const templateMenuStyle: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
  backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 50, overflow: "hidden",
};
const templateMenuItemStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "10px 16px",
  fontSize: 13, fontFamily: "var(--font)", fontWeight: 500,
  border: "none", cursor: "pointer", textAlign: "left", transition: "background-color 0.1s ease",
};

const noteAreaWrapperStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column",
  backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
};
const textareaStyle: React.CSSProperties = {
  width: "100%", padding: 16, fontSize: 13, lineHeight: 1.7, fontFamily: "var(--font)",
  color: "var(--text-primary)", backgroundColor: "transparent", border: "none",
  resize: "vertical", boxSizing: "border-box", outline: "none", minHeight: 220,
};
const coverageRecsInsideStyle: React.CSSProperties = {
  borderTop: "1px solid var(--border)", padding: "12px 16px",
  backgroundColor: "var(--bg-elevated)",
};
const coverageRecsLabelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
  color: "var(--info)", marginBottom: 8,
};
const coverageRecsListStyle: React.CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: 6,
};
const coverageRecBtnStyle: React.CSSProperties = {
  padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: "var(--font)",
  color: "var(--info)", backgroundColor: "var(--info-soft)", border: "1px solid rgba(37, 99, 235, 0.15)",
  borderRadius: "var(--radius-full)", cursor: "pointer", transition: "all 0.1s ease", whiteSpace: "nowrap",
};

const togglesSectionStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 10,
  padding: 14, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)",
};
const toggleDividerStyle: React.CSSProperties = {
  height: 1, backgroundColor: "var(--border)", margin: "4px 0",
};
const legalSuggestionsStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 6, maxHeight: "20vh", overflowY: "auto",
};
const legalItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 10px", backgroundColor: "var(--warning-soft)", border: "1px solid rgba(217, 119, 6, 0.15)",
  borderRadius: "var(--radius-sm)",
};
const acceptBtnStyle: React.CSSProperties = {
  padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "var(--warning)",
  backgroundColor: "transparent", border: "1px solid var(--warning)",
  borderRadius: "var(--radius-sm)", cursor: "pointer", whiteSpace: "nowrap",
};

const toggleRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" };
const trackStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", width: 38, height: 20, borderRadius: 10,
  transition: "background-color 0.2s", flexShrink: 0, cursor: "pointer", border: "1px solid var(--border)",
};
const thumbStyle: React.CSSProperties = {
  width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.2s",
};

const finalizeBtnStyle: React.CSSProperties = {
  padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#fff",
  backgroundColor: "var(--accent)", border: "none", borderRadius: "var(--radius-md)",
  width: "100%", boxShadow: "0 4px 12px rgba(249,115,22,0.15)",
  transition: "all 0.2s ease", letterSpacing: "-0.01em",
};

/* ---------- Modal Styles ---------- */

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  backdropFilter: "blur(4px)",
};
const modalContentStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 20,
  padding: 28, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", maxWidth: 480, width: "90%",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
};
const modalTitleStyle: React.CSSProperties = {
  margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em",
};
const modalSectionStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 10,
};
const modalSectionLabelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
};
const modalBodyStyle: React.CSSProperties = {
  margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6,
};
const modalCheckboxRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
};
const modalCheckboxStyle: React.CSSProperties = {
  width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer",
};
const modalDividerStyle: React.CSSProperties = {
  height: 1, backgroundColor: "var(--border)",
};
const modalSubmitBtnStyle: React.CSSProperties = {
  padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#fff",
  backgroundColor: "var(--accent)", border: "none", borderRadius: "var(--radius-md)",
  width: "100%", boxShadow: "0 4px 12px rgba(249,115,22,0.15)",
  transition: "all 0.2s ease", letterSpacing: "-0.01em",
};
