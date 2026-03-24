import type { ComplianceMapping } from "../types";

export const COMPLIANCE_MAPPINGS: ComplianceMapping[] = [
  // Category 1: Abortion-Related Terminology
  { original: "abortion", replacement: "reproductive health management" },
  { original: "termination of pregnancy", replacement: "pregnancy-related care" },
  { original: "elective pregnancy termination", replacement: "elective reproductive procedure" },
  { original: "medical abortion", replacement: "medication-managed reproductive care" },
  { original: "therapeutic abortion", replacement: "medically indicated pregnancy management" },

  // Category 2: End-of-Life and Euthanasia
  { original: "euthanasia", replacement: "palliative sedation" },
  { original: "physician-assisted suicide", replacement: "medical aid in dying" },
  { original: "assisted suicide", replacement: "end-of-life care option" },
  { original: "merciful killing", replacement: "compassionate end-of-life management" },
  { original: "ending life", replacement: "withdrawal of life-sustaining treatment" },

  // Category 3: Mental Health and Suicide-Related
  { original: "suicide", replacement: "self-directed violence risk" },
  { original: "self-harm", replacement: "self-injurious behavior" },
  { original: "desire to die", replacement: "passive suicidal ideation per clinical assessment" },

  // Category 4: Substance Abuse and Controlled Substances
  { original: "drug seeker", replacement: "patient with pain management needs" },
  { original: "drug abuse", replacement: "substance use disorder" },
  { original: "addict", replacement: "patient with substance use disorder" },
  { original: "prescription shopping", replacement: "multiple-provider prescription history" },
  { original: "alcoholic", replacement: "alcohol use disorder" },
  { original: "overdose", replacement: "substance-related medical event" },

  // Category 5: Disability and Medical Decision-Making
  { original: "incompetent", replacement: "requires capacity evaluation" },
  { original: "unable to consent", replacement: "capacity assessment pending" },
  { original: "guardian decision", replacement: "surrogate decision per verified proxy" },

  // General
  { original: "mental illness", replacement: "behavioral health condition" },
  { original: "domestic violence", replacement: "intimate partner safety concern" },
];
