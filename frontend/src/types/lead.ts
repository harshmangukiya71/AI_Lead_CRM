export type LeadStatus = "New" | "Qualified" | "Lost";
export type LeadTemperature = "Hot" | "Warm" | "Cold";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  industry?: string | null;
  companySize?: string | null;
  budget?: string | null;
  projectDescription: string;
  status: LeadStatus;
  owner?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  leadScore?: number | null;
  temperature?: LeadTemperature | null;
  confidence?: number | null;
  reasoning?: string | null;
  nextAction?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  industry?: string;
  companySize?: string;
  budget?: string;
  projectDescription: string;
};

export type DashboardStats = {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  lostLeads: number;
  recentLeads: Lead[];
  temperatures: Array<{ temperature: LeadTemperature; count: number }>;
};
