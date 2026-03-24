import type { DocumentationGap } from "../types";

export interface GapDetectionRule {
  id: string;
  description: string;
  category: DocumentationGap["category"];
  severity: DocumentationGap["severity"];
  requiredKeywords: string[];
  suggestedText: string;
}

export const GAP_DETECTION_RULES: GapDetectionRule[] = [
  {
    id: "sdoh-housing",
    description: "Missing social determinants of health: housing status",
    category: "SDOH",
    severity: "recommended_for_compliance",
    requiredKeywords: ["housing", "living situation", "homelessness"],
    suggestedText:
      "Patient's housing status: [stable/unstable/homeless]. Living situation: [alone/with family/group home].",
  },
  {
    id: "counseling-duration",
    description: "Missing counseling duration for billing",
    category: "counseling_duration",
    severity: "required_for_billing",
    requiredKeywords: ["counseling duration", "minutes of counseling", "time spent counseling"],
    suggestedText:
      "Counseling duration: approximately [X] minutes were spent in face-to-face counseling with the patient.",
  },
  {
    id: "diagnosis-code",
    description: "Missing diagnosis code reference",
    category: "diagnosis_code",
    severity: "required_for_billing",
    requiredKeywords: ["ICD-10", "diagnosis code", "ICD"],
    suggestedText:
      "Primary diagnosis: [condition] (ICD-10: [code]). Secondary diagnosis: [condition] (ICD-10: [code]).",
  },
  {
    id: "procedure-justification",
    description: "Missing medical necessity justification for procedures",
    category: "procedure_justification",
    severity: "required_for_billing",
    requiredKeywords: ["medical necessity", "procedure justified", "clinically indicated"],
    suggestedText:
      "The procedure is clinically indicated due to [reason]. Medical necessity is established by [clinical findings].",
  },
];
