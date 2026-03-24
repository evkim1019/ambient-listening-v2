import type { TemplateName, GapAnalysisResult, DocumentationGap } from "../types";
import { GAP_DETECTION_RULES } from "../data/gapDetectionRules";

export async function analyzeNoteForGaps(
  noteContent: string,
  _templateName?: TemplateName
): Promise<GapAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lowerContent = noteContent.toLowerCase();
  const gaps: DocumentationGap[] = [];

  for (const rule of GAP_DETECTION_RULES) {
    const hasAnyKeyword = rule.requiredKeywords.some((keyword) =>
      lowerContent.includes(keyword.toLowerCase())
    );

    if (!hasAnyKeyword) {
      gaps.push({
        id: rule.id,
        description: rule.description,
        category: rule.category,
        severity: rule.severity,
        suggestedText: rule.suggestedText,
      });
    }
  }

  return { gaps };
}
