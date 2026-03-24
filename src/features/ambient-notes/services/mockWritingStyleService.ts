import type { WritingStyleProfile } from "../types";

export async function getWritingStyleProfile(
  providerId: string
): Promise<WritingStyleProfile> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (providerId === "no-style-provider") {
    return {
      available: false,
      styleDescription: "",
    };
  }

  return {
    available: true,
    styleDescription:
      "Concise, clinical tone with structured bullet points. " +
      "Prefers active voice and direct statements. " +
      "Uses standard medical abbreviations where appropriate.",
  };
}
