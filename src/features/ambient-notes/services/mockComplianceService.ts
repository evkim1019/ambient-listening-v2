import type { ComplianceMapping, ComplianceFlag } from "../types";
import { COMPLIANCE_MAPPINGS } from "../data/complianceMappings";

export interface ComplianceResult {
  transformedText: string;
  mappings: ComplianceMapping[];
}

/** Scan text and return all flagged terms found, with default replacements. */
export function scanForComplianceFlags(text: string): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const lowerText = text.toLowerCase();
  let idCounter = 0;

  // Sort by length descending so longer phrases match first (e.g. "drug abuse" before "abuse")
  const sorted = [...COMPLIANCE_MAPPINGS].sort((a, b) => b.original.length - a.original.length);

  for (const mapping of sorted) {
    if (lowerText.includes(mapping.original.toLowerCase())) {
      // Avoid duplicates if a longer phrase already covers this
      const alreadyCovered = flags.some(
        (f) => f.original.toLowerCase().includes(mapping.original.toLowerCase()) && f.original !== mapping.original
      );
      if (!alreadyCovered) {
        flags.push({
          id: `flag-${idCounter++}`,
          original: mapping.original,
          replacement: mapping.replacement,
          enabled: true,
        });
      }
    }
  }

  return flags;
}

/** Apply only the user-selected compliance flags to text. */
export function applySelectedCompliance(
  text: string,
  flags: ComplianceFlag[]
): ComplianceResult {
  const enabledFlags = flags.filter((f) => f.enabled);
  const appliedMappings: ComplianceMapping[] = [];
  let transformedText = text;

  // Sort by length descending for correct replacement order
  const sorted = [...enabledFlags].sort((a, b) => b.original.length - a.original.length);

  for (const flag of sorted) {
    const regex = new RegExp(escapeRegExp(flag.original), "gi");
    if (regex.test(transformedText)) {
      appliedMappings.push({ original: flag.original, replacement: flag.replacement });
      transformedText = transformedText.replace(regex, flag.replacement);
    }
  }

  return { transformedText, mappings: appliedMappings };
}

/** Legacy: apply all compliance mappings (used internally). */
export async function applyCompliance(text: string): Promise<ComplianceResult> {
  const appliedMappings: ComplianceMapping[] = [];
  let transformedText = text;

  for (const mapping of COMPLIANCE_MAPPINGS) {
    const regex = new RegExp(escapeRegExp(mapping.original), "gi");
    if (regex.test(transformedText)) {
      appliedMappings.push(mapping);
      transformedText = transformedText.replace(regex, mapping.replacement);
    }
  }

  return { transformedText, mappings: appliedMappings };
}

export function getComplianceMappings(): ComplianceMapping[] {
  return COMPLIANCE_MAPPINGS;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Scan note text and return compliance flags only for terms found in the note. */
export function scanNoteForLegalFlags(noteText: string): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const lowerText = noteText.toLowerCase();
  let idCounter = 0;
  const sorted = [...COMPLIANCE_MAPPINGS].sort((a, b) => b.original.length - a.original.length);
  for (const mapping of sorted) {
    if (lowerText.includes(mapping.original.toLowerCase())) {
      const alreadyCovered = flags.some(
        (f) => f.original.toLowerCase().includes(mapping.original.toLowerCase()) && f.original !== mapping.original
      );
      if (!alreadyCovered) {
        flags.push({
          id: `note-flag-${idCounter++}`,
          original: mapping.original,
          replacement: mapping.replacement,
          enabled: true,
        });
      }
    }
  }
  return flags;
}
