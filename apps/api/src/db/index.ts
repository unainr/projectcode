// lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = (databaseUrl: string) => {
  if (!dbInstance) {
    dbInstance = drizzle(neon(databaseUrl));
  }
  return dbInstance;
};