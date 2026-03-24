import type { TemplateName } from "../types";

export const TEMPLATE_SECTIONS: Record<TemplateName, string[]> = {
  "Behavioral SOAP": ["Subjective", "Objective", "Assessment", "Plan"],
  "BIRP": ["Behavior", "Intervention", "Response", "Plan"],
  "DAP": ["Data", "Assessment", "Plan"],
  "GIRPP": ["Goals", "Intervention", "Response", "Progress", "Plan"],
  "SIRP": ["Situation", "Intervention", "Response", "Plan"],
  "Physical SOAP": ["Subjective", "Objective", "Assessment", "Plan"],
  "Historical and Physical": [
    "Chief Complaint",
    "History of Present Illness",
    "Past Medical History",
    "Review of Systems",
    "Physical Examination",
    "Assessment",
    "Plan",
  ],
};
