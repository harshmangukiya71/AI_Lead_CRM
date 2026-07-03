import type { CorsOptions } from "cors";
import { env } from "./env.js";

const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const configuredOrigins = env.frontendUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...localOrigins, ...configuredOrigins]);

const vercelDeploymentPattern = new RegExp(
  `^https://${env.vercelProjectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-[a-z0-9-]+)*\\.vercel\\.app$`,
  "i"
);

const isAllowedOrigin = (origin: string) => allowedOrigins.has(origin) || vercelDeploymentPattern.test(origin);

export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  }
};
