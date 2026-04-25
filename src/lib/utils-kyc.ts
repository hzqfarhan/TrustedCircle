import { createHash } from "crypto";

/**
 * securely hash a document number so we don't store it in plain text.
 */
export function HashDocumentNumber(docNumber: string): string {
  if (!docNumber) return "";
  return createHash("sha256").update(docNumber.trim()).digest("hex");
}

export function MaskDocumentNumber(docNumber: string): string {
  if (!docNumber) return "";
  const cleaned = docNumber.replace(/\D/g, "");
  if (cleaned.length < 4) return "****";
  const last4 = cleaned.slice(-4);
  return `******-**-${last4}`;
}

export function CalculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

export function GetAgeGroup(age: number): "under_7" | "under_12" | "teen" {
  if (age < 7) return "under_7";
  if (age < 12) return "under_12";
  return "teen";
}


