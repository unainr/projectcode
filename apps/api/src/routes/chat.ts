import { Hono } from "hono";
import { requireUser } from "../middleware/auth";


import { google } from '@ai-sdk/google';
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { getOrCreateSession } from "../lib/session";
import type { CloudflareBindings } from "../types";
import { chatMessages, chats } from "../db/schema";
import { getDb } from "../db";
import { eq,desc } from "drizzle-orm";



type ChatRequest = {
    chatId?: string;
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
      const db = getDb(c.env);

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

   // Resolve or create the chat row
    let chatId = body.chatId;
    if (!chatId) {
      const [newChat] = await db.insert(chats).values({ userId }).returning({ id: chats.id });
      chatId = newChat.id;
    }

     // Persist the latest user message (last item in uiMessages is the new one)
    const latestUserMessage = uiMessages.at(-1);
    if (latestUserMessage?.role === "user") {
      await db.insert(chatMessages).values({
        chatId,
        role: "user",
        parts: latestUserMessage.parts,
      });
    }
  const tools = await session.tools();

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: SYSTEM_PROMPT,
    tools,
    messages: await convertToModelMessages(uiMessages),
    stopWhen: stepCountIs(15),
    onError: (error) => {
      console.error("[chat] streamText error:", error);
    },
  });

  // This returns a Response with the correct AI SDK data-stream headers/format
 
    return result.toUIMessageStreamResponse({
      // send the resolved chatId back to the client on the first chunk
      headers: { "X-Chat-Id": chatId },
    });
})


  // List all chats for the current user, most recent first
  .get("/", async (c) => {
    const userId = c.get("userId");
    const db = getDb(c.env);

    const userChats = await db
      .select({
        id: chats.id,
        title: chats.title,
        updatedAt: chats.updatedAt,
        createdAt: chats.createdAt,
      })
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt));

    return c.json({ chats: userChats });
  })
  // Fetch full message history for one chat
  .get("/:chatId/messages", async (c) => {
    const userId = c.get("userId");
    const chatId = c.req.param("chatId");
    const db = getDb(c.env);

    // Ownership check — don't let user A read user B's chat
    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    if (!chat || chat.userId !== userId) {
      return c.json({ error: "Not found" }, 404);
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(chatMessages.createdAt);

    // Reshape into UIMessage format for useChat's initialMessages
    const uiMessages = messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: m.parts as { type: string; text?: string }[],
    }));

    return c.json({ chatId, messages: uiMessages });
  })
  // Optional: delete a chat
  .delete("/:chatId", async (c) => {
    const userId = c.get("userId");
    const chatId = c.req.param("chatId");
    const db = getDb(c.env);

    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    if (!chat || chat.userId !== userId) {
      return c.json({ error: "Not found" }, 404);
    }

    await db.delete(chats).where(eq(chats.id, chatId));
    return c.json({ success: true });
  });



export default app;
