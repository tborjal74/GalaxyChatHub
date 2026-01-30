import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve absolute path to backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.resolve(__dirname, ".env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
