import { pgTable, text, timestamp, integer, decimal, boolean, uuid } from "drizzle-orm/pg-core";

export const salons = pgTable("salons", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  city: text("city"),
  address: text("address"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  salonId: uuid("salon_id").references(() => salons.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
  imageFileId: text("image_file_id"), // needed to delete from ImageKit later
  isActive: boolean("is_active").default(true),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  salonId: uuid("salon_id").references(() => salons.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  role: text("role"),
  photoUrl: text("photo_url"),
  photoFileId: text("photo_file_id"), // needed to delete from ImageKit later
  isActive: boolean("is_active").default(true),
});

export const staffAvailability = pgTable("staff_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id, { onDelete: "cascade" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  salonId: uuid("salon_id").references(() => salons.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  clientId: text("client_id").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});