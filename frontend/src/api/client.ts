import axios from "axios";
import type { CreateLeadPayload, DashboardStats, Lead, LeadStatus } from "../types/lead";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Could not reach the backend. Please check the connection and try again.";
  }

  const { message, errors } = error.response.data ?? {};
  const fieldMessages = errors
    ? Object.values(errors)
        .flatMap((fieldErrors) => fieldErrors ?? [])
        .filter(Boolean)
    : [];

  if (fieldMessages.length > 0) {
    return fieldMessages.join(" ");
  }

  return message || fallback;
};

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
