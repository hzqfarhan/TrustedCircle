import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const uploadChildKycSchema = z.object({
  fileBase64: z.string().min(1, "File is required"),
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  fileName: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "File size must be less than 10MB"),
});

export const resubmitChildKycSchema = uploadChildKycSchema;
