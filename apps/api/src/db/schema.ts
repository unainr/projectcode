import { pgTable, text, timestamp, integer, decimal, boolean, uuid, jsonb, index, pgEnum } from "drizzle-orm/pg-core";

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



// composio testing schema 
// packages/db/src/schema.ts

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
]);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id").notNull(),

    title: text("title"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("conversations_user_id_idx").on(table.userId),

    updatedAtIdx: index("conversations_updated_at_idx").on(
      table.updatedAt,
    ),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    role: messageRoleEnum("role").notNull(),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_id_idx").on(
      table.conversationId,
    ),
  }),
);

export const aiSessions = pgTable(
  "ai_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id").notNull().unique(),

    composioSessionId: text("composio_session_id").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("ai_sessions_user_id_idx").on(table.userId),
  }),
);



// -----------=========================
export const composioSessions = pgTable("composio_sessions", {
  // Clerk user ID — stable, use directly as Composio userId
  userId:    text("user_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"), // optional: derive from first message later
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  parts: jsonb("parts").notNull(), // store the full UIMessage.parts array (text + tool calls)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});