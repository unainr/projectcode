import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { forms, formFields, formSubmissions } from "./schema";

export type Form = InferSelectModel<typeof forms>;
export type NewForm = InferInsertModel<typeof forms>;

export type FormField = InferSelectModel<typeof formFields>;
export type NewFormField = InferInsertModel<typeof formFields>;

export type FormSubmission = InferSelectModel<typeof formSubmissions>;
export type NewFormSubmission = InferInsertModel<typeof formSubmissions>;

export type FieldType =
  | "text" | "textarea" | "email" | "number" | "select" | "multiselect"
  | "checkbox" | "radio" | "date" | "file" | "rating";

export type FormStatus = "draft" | "published" | "closed";
export type CreationMode = "ai" | "manual";

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FormTheme {
  primaryColor?: string;
  logoUrl?: string;
  fontFamily?: string;
}

export interface FormSettings {
  allowMultipleSubmissions?: boolean;
  closeAt?: string;
  submitLimit?: number;
  requireEmail?: boolean;
}

export interface FormWithFields extends Form {
  fields: FormField[];
}