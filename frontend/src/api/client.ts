import axios from "axios";
import type { CreateLeadPayload, DashboardStats, Lead, LeadStatus } from "../types/lead";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const createLead = async (payload: CreateLeadPayload) => {
  const { data } = await api.post<Lead>("/leads", payload);
  return data;
};

export const getLeads = async (params: { search?: string; status?: LeadStatus | "" }) => {
  const query = {
    search: params.search?.trim() || undefined,
    status: params.status || undefined
  };
  const { data } = await api.get<Lead[]>("/leads", { params: query });
  return data;
};

export const getLead = async (id: string) => {
  const { data } = await api.get<Lead>(`/leads/${id}`);
  return data;
};

export const updateLead = async (
  id: string,
  payload: { status?: LeadStatus; owner?: string | null; notes?: string | null; followUpDate?: string | null }
) => {
  const { data } = await api.put<Lead>(`/leads/${id}`, payload);
  return data;
};

export const deleteLead = async (id: string) => {
  await api.delete(`/leads/${id}`);
};

export const getDashboard = async () => {
  const { data } = await api.get<DashboardStats>("/dashboard");
  return data;
};
