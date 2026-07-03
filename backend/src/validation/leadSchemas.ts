import { LeadStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
  company: optionalText,
  industry: optionalText,
  companySize: optionalText,
  budget: optionalText,
  projectDescription: z.string().trim().min(10, "Project description must be at least 10 characters")
});

export const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  owner: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  followUpDate: z
    .union([z.string().datetime(), z.string().date(), z.literal(""), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (!value) return null;
      return new Date(value);
    })
});

export const listLeadQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(LeadStatus).optional()
});
