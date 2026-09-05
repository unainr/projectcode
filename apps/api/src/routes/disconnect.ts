import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDb } from "../db";

import { and, eq } from "drizzle-orm";
import { deleteImageKitFile } from "../lib/imagekit-auth";
import { salonSchema } from "../schema/salon-schema";
import { salons } from "../db/schema";
import type { CloudflareBindings } from "../types";
import { getOrCreateSession } from "../lib/session";
import { stepCountIs, streamText } from "ai";
import { streamSSE } from "hono/streaming";
import { groq } from "@ai-sdk/groq";
import { createComposio } from "../lib/composio";

const DisconnectBodySchema = z.object({
  // "ca_abc123" — comes from the toolkits list response
  connectedAccountId: z.string().min(1),
});

// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("*", requireUser)
.post(
  "/",
  zValidator("json", DisconnectBodySchema),
  async (c) => {
      const composio = createComposio(c.env);
    const { connectedAccountId } = c.req.valid("json");

    await composio.connectedAccounts.delete(connectedAccountId);

    return c.json({ success: true });
  }
);


export default app;
