import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { app } from "./app.js";

const server = app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
