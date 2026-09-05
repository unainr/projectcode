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
.get("/", async (c) => {
  const userId = c.get("userId");
  const onlyConnected = c.req.query("connected") === "true";
  const cursor = c.req.query("cursor") ?? undefined;

  const session = await getOrCreateSession(userId,c.env);

  const result = await session.toolkits({
    limit: 20,
    ...(onlyConnected && { isConnected: true }),
    ...(cursor && { nextCursor: cursor }),
  });

  const toolkits = result.items.map((toolkit) => ({
    slug: toolkit.slug,
    name: toolkit.name,
    logo: toolkit.logo,
    isConnected: toolkit.connection?.isActive,
    // Only present when connected — used to disconnect
    connectedAccountId: toolkit.connection?.isActive
      ? toolkit.connection.connectedAccount?.id ?? null
      : null,
  }));

  return c.json({
    toolkits,
    nextCursor: result.cursor ?? null,
  });
});


export default app;
