import type { VolatileBufferState } from "../types";

// Module-level variables — in-memory only, no localStorage/IndexedDB
let audioBlob: Blob | null = null;
let rawTranscription: string | null = null;
let redactedSegments: { start: number; end: number }[] = [];

export function storeInBuffer(blob: Blob, transcription: string): void {
  audioBlob = blob;
  rawTranscription = transcription;
}

export function addRedactedSegment(start: number, end: number): void {
  redactedSegments.push({ start, end });
}

export function getBufferState(): VolatileBufferState {
  return {
    audioBlob,
    rawTranscription,
    redactedSegments: [...redactedSegments],
  };
}

export function purgeBuffer(): void {
  audioBlob = null;
  rawTranscription = null;
  redactedSegments = [];
}

export function isBufferActive(): boolean {
  return audioBlob !== null || rawTranscription !== null;
}
