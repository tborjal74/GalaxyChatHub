import 'dotenv/config';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
import pkg from "pg";

const { Pool } = pkg;
console.log("Connecting to:", process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add these two lines to force the connection to wait and be specific
  max: 10,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
}
