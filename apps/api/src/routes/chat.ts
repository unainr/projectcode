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
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { streamSSE } from "hono/streaming";
import { groq } from "@ai-sdk/groq";
import { google } from '@ai-sdk/google';



type ChatRequest = {
	messages?: UIMessage[];
};

const SYSTEM_PROMPT = `\
You are a helpful AI agent with access to 1000+ apps via Composio.

When the user asks you to do something that needs an external app:
1. Use COMPOSIO_SEARCH_TOOLS to find the right tool for the task.
2. If the app isn't connected, COMPOSIO_MANAGE_CONNECTIONS will generate a connect link — share it with the user and ask them to open it.
3. Once connected, execute the tool and report the result clearly.

Always tell the user what you're doing and what action was taken.
Keep responses concise and helpful.`.trim();
// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("*", requireUser)
.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<ChatRequest>();
  const uiMessages = body.messages ?? [];

  let session;
  try {
    session = await getOrCreateSession(userId, c.env);
  } catch (err) {
    console.error("[chat] failed to get/create Composio session:", err);
    return c.json({ error: "Could not connect to session store. Try again shortly." }, 503);
  }

  const tools = await session.tools();

  const result = streamText({
    model: google("gemini-3.5-flash"),
    system: SYSTEM_PROMPT,
    tools,
    messages: await convertToModelMessages(uiMessages),
    stopWhen: stepCountIs(15),
    onError: (error) => {
      console.error("[chat] streamText error:", error);
    },
  });

  // This returns a Response with the correct AI SDK data-stream headers/format
  return result.toUIMessageStreamResponse();
});
export default app;
