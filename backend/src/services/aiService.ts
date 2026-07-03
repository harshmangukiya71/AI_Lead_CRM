import OpenAI from "openai";
import { LeadTemperature } from "@prisma/client";
import { env } from "../config/env.js";
import type { AiQualification, CreateLeadInput } from "../types/lead.js";

const systemPrompt = `You are an expert B2B sales qualification analyst. Evaluate a lead using industry, company size, budget, and project description. Return ONLY valid JSON with this exact shape: {"leadScore":85,"temperature":"Hot","confidence":93,"reasoning":"short business rationale","nextAction":"specific recommended sales action"}. leadScore and confidence must be integers from 0 to 100. temperature must be one of Hot, Warm, or Cold. Do not include markdown, prose, comments, or extra keys.`;

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const parseBudgetSignal = (budget?: string) => {
  if (!budget) return 0;
  const normalized = budget.toLowerCase();
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  if (normalized.includes("100k") || numeric >= 100000) return 28;
  if (normalized.includes("50k") || numeric >= 50000) return 22;
  if (normalized.includes("25k") || numeric >= 25000) return 16;
  if (normalized.includes("10k") || numeric >= 10000) return 10;
  return 5;
};

const deriveTemperature = (leadScore: number): LeadTemperature => {
  if (leadScore >= 75) return LeadTemperature.Hot;
  if (leadScore >= 45) return LeadTemperature.Warm;
  return LeadTemperature.Cold;
};

const fallbackQualification = (lead: CreateLeadInput): AiQualification => {
  let score = 25;
  const description = lead.projectDescription.toLowerCase();
  const size = lead.companySize?.toLowerCase() ?? "";

  score += parseBudgetSignal(lead.budget);
  if (lead.industry) score += 8;
  if (lead.company) score += 6;
  if (size.includes("201") || size.includes("500") || size.includes("1000") || size.includes("enterprise")) score += 18;
  if (size.includes("51") || size.includes("200")) score += 12;
  if (description.includes("urgent") || description.includes("immediate") || description.includes("asap")) score += 14;
  if (description.includes("automation") || description.includes("ai") || description.includes("crm")) score += 10;
  if (description.length > 180) score += 7;

  const leadScore = clampScore(score);
  const temperature = deriveTemperature(leadScore);

  return {
    leadScore,
    temperature,
    confidence: clampScore(78 + (lead.industry ? 8 : 0) + (lead.budget ? 6 : 0)),
    reasoning: `${temperature} lead based on ${lead.industry ?? "their industry"}, ${lead.companySize ?? "unknown company size"}, budget signal, and stated project urgency.`,
    nextAction:
      temperature === LeadTemperature.Hot
        ? "Schedule a discovery call within 24 hours and prepare a tailored proposal."
        : temperature === LeadTemperature.Warm
          ? "Send a consultative follow-up and qualify timeline, budget, and decision process."
          : "Send a nurturing email with relevant case studies and ask one qualifying question."
  };
};

const normalizeQualification = (value: Partial<AiQualification>, lead: CreateLeadInput): AiQualification => {
  const fallback = fallbackQualification(lead);
  const leadScore = clampScore(Number(value.leadScore ?? fallback.leadScore));
  const temperature =
    value.temperature === LeadTemperature.Hot || value.temperature === LeadTemperature.Warm || value.temperature === LeadTemperature.Cold
      ? value.temperature
      : deriveTemperature(leadScore);

  return {
    leadScore,
    temperature,
    confidence: clampScore(Number(value.confidence ?? fallback.confidence)),
    reasoning: typeof value.reasoning === "string" && value.reasoning.trim() ? value.reasoning.trim() : fallback.reasoning,
    nextAction: typeof value.nextAction === "string" && value.nextAction.trim() ? value.nextAction.trim() : fallback.nextAction
  };
};

export const qualifyLead = async (lead: CreateLeadInput): Promise<AiQualification> => {
  if (!env.openAiApiKey) {
    return fallbackQualification(lead);
  }

  try {
    const client = new OpenAI({ apiKey: env.openAiApiKey });
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            industry: lead.industry ?? null,
            companySize: lead.companySize ?? null,
            budget: lead.budget ?? null,
            projectDescription: lead.projectDescription
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) return fallbackQualification(lead);
    return normalizeQualification(JSON.parse(content), lead);
  } catch (error) {
    console.warn("AI qualification failed; using fallback rules.", error);
    return fallbackQualification(lead);
  }
};

export const aiSystemPrompt = systemPrompt;
