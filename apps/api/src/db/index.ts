// lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Bindings } from "../lib/env";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb(env: Bindings) {
  const sql = neon(env.DATABASE_URL);

  return drizzle(sql, {
    schema,
  });
}