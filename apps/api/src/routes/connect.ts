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

const ConnectBodySchema = z.object({
  // e.g. "github", "gmail", "slack", "notion"
  toolkit: z.string().min(1),
});


// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("*", requireUser)

.post("/", zValidator("json", ConnectBodySchema), async (c) => {
  const userId = c.get("userId");
  const { toolkit } = c.req.valid("json");

  const session = await getOrCreateSession(userId, c.env);

  const connectionRequest = await session.authorize(toolkit, {
    // Composio appends ?status=success&connected_account_id=ca_xxx to this URL
    callbackUrl: `${c.env.WEB_URL}/agent/callback?toolkit=${toolkit}`,
  });

  return c.json({
    toolkit,
    redirectUrl: connectionRequest.redirectUrl,
  });
});
export default app;
