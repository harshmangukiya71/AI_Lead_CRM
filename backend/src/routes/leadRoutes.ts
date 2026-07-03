import { Router } from "express";
import * as leadController from "../controllers/leadController.js";

export const leadRoutes = Router();

leadRoutes.post("/", leadController.createLead);
leadRoutes.get("/", leadController.listLeads);
leadRoutes.get("/:id", leadController.getLead);
leadRoutes.put("/:id", leadController.updateLead);
leadRoutes.delete("/:id", leadController.deleteLead);
