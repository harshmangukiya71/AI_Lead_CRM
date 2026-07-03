import type { Request, Response } from "express";
import { getDashboardStats } from "../services/leadService.js";

export const getDashboard = async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.json(stats);
};
