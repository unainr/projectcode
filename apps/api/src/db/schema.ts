import { pgTable, text, timestamp, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { FieldValidation, FormSettings, FormTheme } from "./types";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "closed"]);
export const creationModeEnum = pgEnum("creation_mode", ["ai", "manual"]);
export const fieldTypeEnum = pgEnum("field_type", [
  "text", "textarea", "email", "number", "select", "multiselect",
  "checkbox", "radio", "date", "file", "rating",
]);

export const forms = pgTable("forms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(), // clerk userId
  title: text("title").notNull(),
  description: text("description"),
  creationMode: creationModeEnum("creation_mode").notNull(),
  status: formStatusEnum("status").notNull().default("draft"),
  theme: jsonb("theme").$type<FormTheme>(),
  slug: text("slug").notNull().unique(),
  settings: jsonb("settings").$type<FormSettings>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const formFields = pgTable("form_fields", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  type: fieldTypeEnum("type").notNull(),
  label: text("label").notNull(),
  placeholder: text("placeholder"),
  required: boolean("required").notNull().default(false),
  options: jsonb("options").$type<string[]>(),
  order: integer("order").notNull().default(0),
  validation: jsonb("validation").$type<FieldValidation>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  formId: text("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  respondentEmail: text("respondent_email"),
  ipAddress: text("ip_address"),
});

// ---- Zod schemas (derived from table defs — single source of truth) ----
export const insertFormSchema = createInsertSchema(forms);
export const selectFormSchema = createSelectSchema(forms);
export const insertFormFieldSchema = createInsertSchema(formFields);
export const selectFormFieldSchema = createSelectSchema(formFields);
export const insertSubmissionSchema = createInsertSchema(formSubmissions);
export const selectSubmissionSchema = createSelectSchema(formSubmissions);