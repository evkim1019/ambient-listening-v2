import React, { createContext, useCallback, useContext, useState } from "react";
import type {
  ComplianceFlag,
  DocumentationGap,
  ExportResult,
  GeneratedNote,
  SensitivityDetection,
  TemplateName,
} from "../types";
import { purgeBuffer } from "../services/volatileAudioBuffer";

export interface AmbientNotesState {
  // Screen 2 state
  audioBlob: Blob | null;
  isListening: boolean;
  isPaused: boolean;
  activeSensitivityFlags: SensitivityDetection[];
  redactedSegments: { start: number; end: number }[];

  // Screen 3 state
  transcription: string;
  complianceEnabled: boolean;
  complianceFlags: ComplianceFlag[];
  templateEnabled: boolean;
  selectedTemplate: TemplateName | null;
  writingStyleEnabled: boolean;

  // Screen 4 state
  generatedNote: GeneratedNote | null;
  editedNoteContent: string;
  documentationGaps: DocumentationGap[];

  // Screen 5 state (Data Retention)
  dataRetentionConfirmed: boolean | null;

  // Screen 6 state (Attestation)
  attestationCompleted: boolean;
  attestationTimestamp: string | null;

  // Screen 7 state
  exportResult: ExportResult | null;
}

export interface AmbientNotesActions {
  setAudioBlob: (blob: Blob | null) => void;
  setIsListening: (listening: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setActiveSensitivityFlags: React.Dispatch<React.SetStateAction<SensitivityDetection[]>>;
  setRedactedSegments: (segments: { start: number; end: number }[]) => void;
  setTranscription: (text: string) => void;
  setComplianceEnabled: (enabled: boolean) => void;
  setComplianceFlags: (flags: ComplianceFlag[]) => void;
  setTemplateEnabled: (enabled: boolean) => void;
  setSelectedTemplate: (template: TemplateName | null) => void;
  setWritingStyleEnabled: (enabled: boolean) => void;
  setGeneratedNote: (note: GeneratedNote | null) => void;
  setEditedNoteContent: (content: string) => void;
  setDocumentationGaps: (gaps: DocumentationGap[]) => void;
  setDataRetentionConfirmed: (confirmed: boolean | null) => void;
  setAttestationCompleted: (completed: boolean) => void;
  setAttestationTimestamp: (timestamp: string | null) => void;
  setExportResult: (result: ExportResult | null) => void;
  resetSession: () => void;
}

const defaultState: AmbientNotesState = {
  audioBlob: null,
  isListening: false,
  isPaused: false,
  activeSensitivityFlags: [],
  redactedSegments: [],
  transcription: "",
  complianceEnabled: false,
  complianceFlags: [],
  templateEnabled: false,
  selectedTemplate: null,
  writingStyleEnabled: false,
  generatedNote: null,
  editedNoteContent: "",
  documentationGaps: [],
  dataRetentionConfirmed: null,
  attestationCompleted: false,
  attestationTimestamp: null,
  exportResult: null,
};

const AmbientNotesContext = createContext<
  (AmbientNotesState & AmbientNotesActions) | null
>(null);

export const AmbientNotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(defaultState.audioBlob);
  const [isListening, setIsListening] = useState(defaultState.isListening);
  const [isPaused, setIsPaused] = useState(defaultState.isPaused);
  const [activeSensitivityFlags, setActiveSensitivityFlags] = useState<SensitivityDetection[]>(defaultState.activeSensitivityFlags);
  const [redactedSegments, setRedactedSegments] = useState<{ start: number; end: number }[]>(defaultState.redactedSegments);
  const [transcription, setTranscription] = useState(defaultState.transcription);
  const [complianceEnabled, setComplianceEnabled] = useState(defaultState.complianceEnabled);
  const [complianceFlags, setComplianceFlags] = useState<ComplianceFlag[]>(defaultState.complianceFlags);
  const [templateEnabled, setTemplateEnabled] = useState(defaultState.templateEnabled);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName | null>(defaultState.selectedTemplate);
  const [writingStyleEnabled, setWritingStyleEnabled] = useState(defaultState.writingStyleEnabled);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(defaultState.generatedNote);
  const [editedNoteContent, setEditedNoteContent] = useState(defaultState.editedNoteContent);
  const [documentationGaps, setDocumentationGaps] = useState<DocumentationGap[]>(defaultState.documentationGaps);
  const [dataRetentionConfirmed, setDataRetentionConfirmed] = useState<boolean | null>(defaultState.dataRetentionConfirmed);
  const [attestationCompleted, setAttestationCompleted] = useState(defaultState.attestationCompleted);
  const [attestationTimestamp, setAttestationTimestamp] = useState<string | null>(defaultState.attestationTimestamp);
  const [exportResult, setExportResult] = useState<ExportResult | null>(defaultState.exportResult);

  const resetSession = useCallback(() => {
    purgeBuffer();
    setAudioBlob(defaultState.audioBlob);
    setIsListening(defaultState.isListening);
    setIsPaused(defaultState.isPaused);
    setActiveSensitivityFlags(defaultState.activeSensitivityFlags);
    setRedactedSegments(defaultState.redactedSegments);
    setTranscription(defaultState.transcription);
    setComplianceEnabled(defaultState.complianceEnabled);
    setComplianceFlags(defaultState.complianceFlags);
    setTemplateEnabled(defaultState.templateEnabled);
    setSelectedTemplate(defaultState.selectedTemplate);
    setWritingStyleEnabled(defaultState.writingStyleEnabled);
    setGeneratedNote(defaultState.generatedNote);
    setEditedNoteContent(defaultState.editedNoteContent);
    setDocumentationGaps(defaultState.documentationGaps);
    setDataRetentionConfirmed(defaultState.dataRetentionConfirmed);
    setAttestationCompleted(defaultState.attestationCompleted);
    setAttestationTimestamp(defaultState.attestationTimestamp);
    setExportResult(defaultState.exportResult);
  }, []);

  const value: AmbientNotesState & AmbientNotesActions = {
    audioBlob,
    isListening,
    isPaused,
    activeSensitivityFlags,
    redactedSegments,
    transcription,
    complianceEnabled,
    complianceFlags,
    templateEnabled,
    selectedTemplate,
    writingStyleEnabled,
    generatedNote,
    editedNoteContent,
    documentationGaps,
    dataRetentionConfirmed,
    attestationCompleted,
    attestationTimestamp,
    exportResult,
    setAudioBlob,
    setIsListening,
    setIsPaused,
    setActiveSensitivityFlags,
    setRedactedSegments,
    setTranscription,
    setComplianceEnabled,
    setComplianceFlags,
    setTemplateEnabled,
    setSelectedTemplate,
    setWritingStyleEnabled,
    setGeneratedNote,
    setEditedNoteContent,
    setDocumentationGaps,
    setDataRetentionConfirmed,
    setAttestationCompleted,
    setAttestationTimestamp,
    setExportResult,
    resetSession,
  };

  return (
    <AmbientNotesContext.Provider value={value}>
      {children}
    </AmbientNotesContext.Provider>
  );
};

export function useAmbientNotes(): AmbientNotesState & AmbientNotesActions {
  const context = useContext(AmbientNotesContext);
  if (!context) {
    throw new Error("useAmbientNotes must be used within an AmbientNotesProvider");
  }
  return context;
}
