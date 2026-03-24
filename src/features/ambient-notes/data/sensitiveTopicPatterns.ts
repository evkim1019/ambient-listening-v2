import type { SensitivityDetection } from "../types";

export const SENSITIVE_TOPIC_PATTERNS: {
  pattern: string;
  category: SensitivityDetection["category"];
  suggestedAlternative: string;
}[] = [
  // Category 1: Abortion-Related Terminology
  { pattern: "abortion", category: "legal_sensitive", suggestedAlternative: "reproductive health management" },
  { pattern: "termination of pregnancy", category: "legal_sensitive", suggestedAlternative: "pregnancy-related care (ICD-10 O09.9)" },
  { pattern: "elective pregnancy termination", category: "legal_sensitive", suggestedAlternative: "elective reproductive procedure" },
  { pattern: "medical abortion", category: "legal_sensitive", suggestedAlternative: "medication-managed reproductive care" },
  { pattern: "therapeutic abortion", category: "legal_sensitive", suggestedAlternative: "medically indicated pregnancy management" },

  // Category 2: End-of-Life and Euthanasia References
  { pattern: "euthanasia", category: "end_of_life", suggestedAlternative: "palliative sedation / comfort-focused care" },
  { pattern: "physician-assisted suicide", category: "end_of_life", suggestedAlternative: "medical aid in dying (where legally authorized)" },
  { pattern: "assisted suicide", category: "end_of_life", suggestedAlternative: "end-of-life care options" },
  { pattern: "merciful killing", category: "end_of_life", suggestedAlternative: "compassionate end-of-life management" },
  { pattern: "ending life", category: "end_of_life", suggestedAlternative: "withdrawal of life-sustaining treatment" },

  // Category 3: Mental Health and Suicide-Related Language
  { pattern: "suicide", category: "self_harm", suggestedAlternative: "self-directed violence risk assessment" },
  { pattern: "self-harm", category: "self_harm", suggestedAlternative: "self-injurious behavior" },
  { pattern: "desire to die", category: "self_harm", suggestedAlternative: "passive suicidal ideation (per clinical assessment)" },
  { pattern: "self-harm intent", category: "self_harm", suggestedAlternative: "risk of self-injurious behavior" },

  // Category 4: Substance Abuse and Controlled Substances
  { pattern: "drug seeker", category: "substance_abuse", suggestedAlternative: "patient with pain management needs" },
  { pattern: "drug abuse", category: "substance_abuse", suggestedAlternative: "substance use disorder (ICD-10 F19.9)" },
  { pattern: "addict", category: "substance_abuse", suggestedAlternative: "patient with substance use disorder" },
  { pattern: "prescription shopping", category: "substance_abuse", suggestedAlternative: "multiple-provider prescription history" },
  { pattern: "alcoholic", category: "substance_abuse", suggestedAlternative: "alcohol use disorder (ICD-10 F10.9)" },
  { pattern: "overdose", category: "substance_abuse", suggestedAlternative: "substance-related medical event" },

  // Category 5: Disability and Medical Decision-Making
  { pattern: "incompetent", category: "disability_capacity", suggestedAlternative: "requires capacity evaluation" },
  { pattern: "unable to consent", category: "disability_capacity", suggestedAlternative: "capacity assessment pending" },
  { pattern: "guardian decision", category: "disability_capacity", suggestedAlternative: "surrogate decision (verify POA/proxy status)" },

  // General: Domestic Violence
  { pattern: "domestic violence", category: "domestic_violence", suggestedAlternative: "intimate partner safety concern" },
];
