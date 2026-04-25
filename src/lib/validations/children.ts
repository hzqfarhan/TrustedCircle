import { z } from "zod";

export const createChildSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  nickname: z.string().min(1, "Nickname is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  relationship: z.enum(["father", "mother", "guardian", "other"]),
  documentType: z.enum(["mykid", "birth_certificate"]),
  documentNumber: z.string().min(5, "Document number required"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Parent consent is required" })
  }),
});

export const updateChildSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  email: z.string().email("Invalid email address"),
  relationship: z.enum(["father", "mother", "guardian", "other"]),
});

export const removeChildSchema = z.object({
  confirm: z.boolean(),
});
