// apps/api/src/db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  imageFileId: text("image_file_id").notNull(), // needed to delete later
  createdAt: timestamp("created_at").notNull().defaultNow(),
});