import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { qualifyLead } from "./aiService.js";
import { sendAcknowledgementEmail } from "./emailService.js";
import type { CreateLeadInput, UpdateLeadInput } from "../types/lead.js";

export const createLead = async (input: CreateLeadInput) => {
  const lead = await prisma.lead.create({ data: input });
  const qualification = await qualifyLead(input);

  const updatedLead = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      leadScore: qualification.leadScore,
      temperature: qualification.temperature,
      confidence: qualification.confidence,
      reasoning: qualification.reasoning,
      nextAction: qualification.nextAction,
      status: qualification.temperature === "Hot" ? LeadStatus.Qualified : LeadStatus.New
    }
  });

  await sendAcknowledgementEmail(input).catch((error) => {
    console.warn("Acknowledgement email failed.", error);
  });

  return updatedLead;
};

export const listLeads = async (filters: { search?: string; status?: LeadStatus }) => {
  const where: Prisma.LeadWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { industry: { contains: filters.search, mode: "insensitive" } }
    ];
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
};

export const getLeadById = async (id: string) => {
  return prisma.lead.findUniqueOrThrow({ where: { id } });
};

export const updateLead = async (id: string, input: UpdateLeadInput) => {
  return prisma.lead.update({
    where: { id },
    data: input
  });
};

export const deleteLead = async (id: string) => {
  await prisma.lead.delete({ where: { id } });
};

export const getDashboardStats = async () => {
  const [totalLeads, newLeads, qualifiedLeads, lostLeads, recentLeads, temperatureGroups] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: LeadStatus.New } }),
    prisma.lead.count({ where: { status: LeadStatus.Qualified } }),
    prisma.lead.count({ where: { status: LeadStatus.Lost } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.groupBy({
      by: ["temperature"],
      _count: { temperature: true },
      where: { temperature: { not: null } }
    })
  ]);

  return {
    totalLeads,
    newLeads,
    qualifiedLeads,
    lostLeads,
    recentLeads,
    temperatures: temperatureGroups.map((item) => ({
      temperature: item.temperature ?? "Cold",
      count: item._count.temperature
    }))
  };
};
