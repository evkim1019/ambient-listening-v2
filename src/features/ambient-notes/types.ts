export type TemplateName =
  | "Behavioral SOAP"
  | "BIRP"
  | "DAP"
  | "GIRPP"
  | "SIRP"
  | "Physical SOAP"
  | "Historical and Physical";

export interface ComplianceMapping {
  original: string;
  replacement: string;
}

export interface ComplianceFlag {
  id: string;
  original: string;
  replacement: string;
  enabled: boolean;
}

export interface TranscriptionResult {
  text: string;
  segments: { start: number; end: number; text: string }[];
}

export interface GeneratedNote {
  content: string;
  complianceMappings?: ComplianceMapping[];
  recommendedSentences?: string[];
}

export interface WritingStyleProfile {
  available: boolean;
  styleDescription: string;
}

export interface EHRSystem {
  id: string;
  name: string;
  icon: string;
}

export interface ExportResult {
  success: boolean;
  ehrSystem: string;
  timestamp: string;
  referenceId: string;
  attestationTimestamp?: string;
  attestedByProviderId?: string;
}

export type ListeningStatus = "idle" | "listening" | "paused";

export interface SensitivityDetection {
  topic: string;
  category: "substance_abuse" | "self_harm" | "domestic_violence" | "legal_sensitive" | "end_of_life" | "disability_capacity";
  timestampMs: number;
  suggestedAlternative: string;
}

export interface DocumentationGap {
  id: string;
  description: string;
  category: "SDOH" | "counseling_duration" | "diagnosis_code" | "procedure_justification" | "other";
  severity: "required_for_billing" | "recommended_for_compliance" | "suggested_for_completeness";
  suggestedText: string;
}

export interface GapAnalysisResult {
  gaps: DocumentationGap[];
}

export interface AttestationRecord {
  attestedAt: string;
  providerId: string;
  noteContentHash: string;
}

export interface VolatileBufferState {
  audioBlob: Blob | null;
  rawTranscription: string | null;
  redactedSegments: { start: number; end: number }[];
}
