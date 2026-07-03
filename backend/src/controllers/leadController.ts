import type { Request, Response } from "express";
import { createLeadSchema, listLeadQuerySchema, updateLeadSchema } from "../validation/leadSchemas.js";
import * as leadService from "../services/leadService.js";

const getRouteId = (req: Request) => String(req.params.id);

export const createLead = async (req: Request, res: Response) => {
  const input = createLeadSchema.parse(req.body);
  const lead = await leadService.createLead(input);
  res.status(201).json(lead);
};

export const listLeads = async (req: Request, res: Response) => {
  const filters = listLeadQuerySchema.parse(req.query);
  const leads = await leadService.listLeads(filters);
  res.json(leads);
};

export const getLead = async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(getRouteId(req));
  res.json(lead);
};

export const updateLead = async (req: Request, res: Response) => {
  const input = updateLeadSchema.parse(req.body);
  const lead = await leadService.updateLead(getRouteId(req), input);
  res.json(lead);
};

export const deleteLead = async (req: Request, res: Response) => {
  await leadService.deleteLead(getRouteId(req));
  res.status(204).send();
};
