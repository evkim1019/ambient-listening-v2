import type { TranscriptionResult } from "../types";

const DUMMY_TRANSCRIPTION_TEXT =
  `Doctor: Good morning. How have you been feeling since our last visit?\n` +
  `Patient: Not great, honestly. I've been having a lot of anxiety and some dark thoughts. ` +
  `I even had thoughts of suicide last week, which really scared me.\n` +
  `Doctor: I'm glad you're telling me about this. Have you had any thoughts of self-harm or ` +
  `actually hurting yourself?\n` +
  `Patient: No self-harm, but the thoughts were persistent. I also started drinking more. ` +
  `My family thinks I might have a drug abuse problem, but I disagree.\n` +
  `Doctor: Let's talk about that. Any history of domestic violence or unsafe situations at home?\n` +
  `Patient: No, nothing like that. My home life is stable. But I did want to ask about ` +
  `my grandmother — she's been talking about euthanasia and ending life on her own terms. ` +
  `It's been weighing on me.\n` +
  `Doctor: That's understandable. We can discuss palliative options for her care. ` +
  `Also, I see from your chart you had a question about a previous abortion — ` +
  `do you want to discuss any reproductive health concerns today?\n` +
  `Patient: Yes, I had a termination of pregnancy last year and I've been having some ` +
  `complications. I just want to make sure everything is okay.\n` +
  `Doctor: Okay. I'd like to adjust your medication and refer you to a behavioral health specialist. ` +
  `We should also discuss your mental illness history and make sure we have a comprehensive plan.`;

const DUMMY_SEGMENTS: TranscriptionResult["segments"] = [
  { start: 0, end: 5, text: "Doctor: Good morning. How have you been feeling since our last visit?" },
  { start: 5, end: 18, text: "Patient: Not great, honestly. I've been having a lot of anxiety and some dark thoughts. I even had thoughts of suicide last week, which really scared me." },
  { start: 18, end: 28, text: "Doctor: I'm glad you're telling me about this. Have you had any thoughts of self-harm or actually hurting yourself?" },
  { start: 28, end: 42, text: "Patient: No self-harm, but the thoughts were persistent. I also started drinking more. My family thinks I might have a drug abuse problem, but I disagree." },
  { start: 42, end: 50, text: "Doctor: Let's talk about that. Any history of domestic violence or unsafe situations at home?" },
  { start: 50, end: 62, text: "Patient: No, nothing like that. My home life is stable. But I did want to ask about my grandmother — she's been talking about euthanasia and ending life on her own terms. It's been weighing on me." },
  { start: 62, end: 75, text: "Doctor: That's understandable. We can discuss palliative options for her care. Also, I see from your chart you had a question about a previous abortion — do you want to discuss any reproductive health concerns today?" },
  { start: 75, end: 88, text: "Patient: Yes, I had a termination of pregnancy last year and I've been having some complications. I just want to make sure everything is okay." },
  { start: 88, end: 100, text: "Doctor: Okay. I'd like to adjust your medication and refer you to a behavioral health specialist. We should also discuss your mental illness history and make sure we have a comprehensive plan." },
];

function randomDelay(): Promise<void> {
  const ms = 1000 + Math.random() * 1000; // 1-2s
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudio(
  _audioBlob: Blob,
  simulateError?: boolean
): Promise<TranscriptionResult> {
  await randomDelay();

  if (simulateError) {
    throw new Error("Transcription service unavailable. Please try again.");
  }

  return {
    text: DUMMY_TRANSCRIPTION_TEXT,
    segments: DUMMY_SEGMENTS,
  };
}
