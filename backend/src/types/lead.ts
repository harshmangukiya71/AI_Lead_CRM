import { LeadStatus, LeadTemperature } from "@prisma/client";

export type AiQualification = {
  leadScore: number;
  temperature: LeadTemperature;
  confidence: number;
  reasoning: string;
  nextAction: string;
};

export type CreateLeadInput = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  industry?: string;
  companySize?: string;
  budget?: string;
  projectDescription: string;
};

export type UpdateLeadInput = {
  status?: LeadStatus;
  owner?: string | null;
  notes?: string | null;
  followUpDate?: Date | null;
};
