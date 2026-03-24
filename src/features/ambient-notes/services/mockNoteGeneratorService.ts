import type { TemplateName, GeneratedNote, ComplianceMapping, ComplianceFlag } from "../types";
import { TEMPLATE_SECTIONS } from "../data/templates";
import { applySelectedCompliance } from "./mockComplianceService";

export interface NoteGenerationOptions {
  transcription: string;
  template?: TemplateName;
  complianceFlags: ComplianceFlag[];
  simulateError?: boolean;
}

const SECTION_CONTENT: Record<string, string> = {
  Subjective:
    "Patient reports increased anxiety and persistent dark thoughts over the past week, including thoughts of suicide. " +
    "Patient denies self-harm but acknowledges increased alcohol consumption. Family expresses concern about possible drug abuse. " +
    "Patient denies domestic violence or unsafe home environment. " +
    "Patient also reports distress related to grandmother discussing euthanasia and ending life. " +
    "Patient inquires about complications following a termination of pregnancy last year.",
  Objective:
    "Patient appears anxious but cooperative. Affect is flat. Speech is normal rate and rhythm. " +
    "No evidence of acute distress. Vital signs within normal limits.",
  Assessment:
    "Patient presents with worsening anxiety and suicidal ideation without plan or intent. " +
    "Possible substance use disorder requiring further evaluation. Mental illness history warrants comprehensive review. " +
    "Family stressor related to grandmother's end-of-life wishes. Post-abortion follow-up indicated.",
  Plan:
    "1. Adjust current medication regimen. 2. Refer to behavioral health specialist for comprehensive evaluation. " +
    "3. Safety planning for suicidal ideation. 4. Follow-up appointment in 2 weeks. 5. Encourage patient to contact crisis line if needed. " +
    "6. OB/GYN referral for post-abortion complication assessment. 7. Provide palliative care resources for grandmother.",
  Behavior:
    "Patient exhibited anxious behavior during session. Fidgeting noted. Patient was forthcoming about dark thoughts and substance use concerns.",
  Intervention:
    "Conducted risk assessment for suicidal ideation. Discussed coping strategies and safety planning. " +
    "Reviewed medication options and referral to specialist. Addressed patient concerns regarding grandmother's euthanasia discussions.",
  Response:
    "Patient was receptive to safety planning and medication adjustment. Expressed willingness to see a behavioral health specialist.",
  Progress:
    "Patient has shown willingness to engage in treatment. This is the first disclosure of suicidal ideation. " +
    "Substance use concerns are new since last visit. New stressors include family end-of-life discussions and reproductive health follow-up.",
  Data:
    "Patient reports anxiety, suicidal ideation without plan, increased alcohol use, and family concerns about drug abuse. " +
    "Denies self-harm and domestic violence. Home environment reported as stable. " +
    "Reports grandmother discussing euthanasia. Reports prior abortion with ongoing complications.",
  Goals:
    "1. Reduce suicidal ideation. 2. Address substance use concerns. 3. Stabilize anxiety symptoms. " +
    "4. Establish ongoing behavioral health support. 5. Resolve reproductive health complications.",
  Situation:
    "Patient presents for follow-up visit with new complaints of suicidal ideation, increased anxiety, substance use concerns, " +
    "family distress over end-of-life discussions, and post-abortion complications.",
  "Chief Complaint":
    "Worsening anxiety, dark thoughts, suicidal ideation, and reproductive health follow-up.",
  "History of Present Illness":
    "Patient reports progressive anxiety over the past several weeks with new onset of suicidal ideation last week. " +
    "Patient also reports increased alcohol consumption. Family has raised concerns about possible drug abuse. " +
    "Patient reports distress over grandmother's discussions about euthanasia. " +
    "Patient had a termination of pregnancy approximately one year ago and reports ongoing complications.",
  "Past Medical History":
    "History of generalized anxiety disorder. No prior psychiatric hospitalizations. No prior suicide attempts. " +
    "History of abortion (one year prior) with reported complications.",
  "Review of Systems":
    "Psychiatric: Anxiety, suicidal ideation, insomnia. Neurological: No headaches, no dizziness. " +
    "General: Fatigue, decreased appetite. Reproductive: Post-abortion complications reported.",
  "Physical Examination":
    "General: Alert, oriented, anxious appearance. Vital signs: BP 128/82, HR 88, Temp 98.6°F. " +
    "Neurological: Cranial nerves intact. No focal deficits.",
};

const RECOMMENDED_SENTENCES = [
  "Patient reports increased anxiety and persistent dark thoughts including suicidal ideation over the past week.",
  "Patient denies self-harm but acknowledges increased alcohol consumption and family concerns about drug abuse.",
  "No evidence of domestic violence or unsafe home environment per patient report.",
  "Patient reports distress related to grandmother discussing euthanasia and ending life on her own terms.",
  "Patient inquires about complications following a termination of pregnancy approximately one year ago.",
  "Recommend medication adjustment and referral to behavioral health specialist for comprehensive evaluation.",
  "Safety planning discussed; patient to contact crisis line if suicidal thoughts intensify.",
  "OB/GYN referral recommended for post-abortion complication assessment.",
  "Provide palliative care and end-of-life planning resources for patient's grandmother.",
  "Follow-up appointment scheduled in 2 weeks to reassess symptoms and treatment response.",
];

function randomDelay(): Promise<void> {
  const ms = 1000 + Math.random() * 1000;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateNote(
  options: NoteGenerationOptions
): Promise<GeneratedNote> {
  await randomDelay();

  if (options.simulateError) {
    throw new Error("Note generation service unavailable. Please try again.");
  }

  let content: string;
  let complianceMappings: ComplianceMapping[] | undefined;
  let recommendedSentences: string[] | undefined;

  if (options.template) {
    const sections = TEMPLATE_SECTIONS[options.template];
    const parts = sections.map((section) => {
      const body = SECTION_CONTENT[section] ?? `[Content for ${section}]`;
      return `## ${section}\n\n${body}`;
    });
    content = parts.join("\n\n");
  } else {
    content = "";
    recommendedSentences = [...RECOMMENDED_SENTENCES];
  }

  const enabledFlags = options.complianceFlags.filter((f) => f.enabled);

  if (enabledFlags.length > 0) {
    if (content) {
      const result = applySelectedCompliance(content, enabledFlags);
      content = result.transformedText;
      complianceMappings = result.mappings;
    }
    if (recommendedSentences) {
      const transformed: string[] = [];
      const allMappings: ComplianceMapping[] = complianceMappings
        ? [...complianceMappings]
        : [];
      for (const sentence of recommendedSentences) {
        const result = applySelectedCompliance(sentence, enabledFlags);
        transformed.push(result.transformedText);
        for (const m of result.mappings) {
          if (!allMappings.some((e) => e.original === m.original)) {
            allMappings.push(m);
          }
        }
      }
      recommendedSentences = transformed;
      complianceMappings = allMappings.length > 0 ? allMappings : undefined;
    }
  }

  return {
    content,
    complianceMappings,
    recommendedSentences,
  };
}
