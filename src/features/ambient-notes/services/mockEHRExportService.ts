import type { EHRSystem, ExportResult } from "../types";
import { EHR_SYSTEMS } from "../data/ehrSystems";

export async function getAvailableEHRSystems(): Promise<EHRSystem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return EHR_SYSTEMS;
}

export async function exportToEHR(
  ehrSystemId: string,
  _note: string,
  _transcript?: string,
  simulateError?: boolean
): Promise<ExportResult> {
  const ms = 1000 + Math.random() * 1000; // 1-2s
  await new Promise((resolve) => setTimeout(resolve, ms));

  if (simulateError) {
    throw new Error("EHR export failed. The target system is unavailable. Please try again.");
  }

  const system = EHR_SYSTEMS.find((s) => s.id === ehrSystemId);
  const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    success: true,
    ehrSystem: system?.name ?? ehrSystemId,
    timestamp: new Date().toISOString(),
    referenceId,
  };
}
