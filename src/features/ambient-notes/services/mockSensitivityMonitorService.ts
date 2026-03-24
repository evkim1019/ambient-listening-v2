import type { SensitivityDetection } from "../types";
import { SENSITIVE_TOPIC_PATTERNS } from "../data/sensitiveTopicPatterns";

export async function analyzeAudioChunk(
  _audioChunk: Blob
): Promise<SensitivityDetection | null> {
  const delayMs = 200 + Math.random() * 300; // 200-500ms
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // ~30% chance of detecting a sensitive topic
  if (Math.random() > 0.3) {
    return null;
  }

  const pattern =
    SENSITIVE_TOPIC_PATTERNS[
      Math.floor(Math.random() * SENSITIVE_TOPIC_PATTERNS.length)
    ];

  return {
    topic: pattern.pattern,
    category: pattern.category,
    timestampMs: Date.now(),
    suggestedAlternative: pattern.suggestedAlternative,
  };
}

export function getSensitiveTopicPatterns(): {
  pattern: string;
  category: string;
  suggestedAlternative: string;
}[] {
  return SENSITIVE_TOPIC_PATTERNS.map((p) => ({
    pattern: p.pattern,
    category: p.category,
    suggestedAlternative: p.suggestedAlternative,
  }));
}
