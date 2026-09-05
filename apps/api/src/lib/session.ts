import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { Bindings } from "./env";
import { composioSessions } from "../db/schema";
import { createComposio } from "./composio";

const sessionConfig = {
  manageConnections: true,
};
/**
 * Returns the existing Composio session for a user, or creates one
 * and persists the session ID so every future request reuses it.
 *
 * Sessions are persistent on Composio's side — creating a new one
 * every request discards connection state and tool context.
 */
export async function getOrCreateSession(userId: string,env:Bindings) {
    const db = getDb(env);
      const composio = createComposio(env);
 const existing = await db.select().from(composioSessions).where(eq(composioSessions.userId, userId))


   if (existing.length > 0) {
    const session = await composio.use(existing[0].sessionId);
    await session.update(sessionConfig);
    return session;
  }
  // First time for this user: create and store
 const session = await composio.sessions.create(userId, sessionConfig);

  await db.insert(composioSessions).values({
    userId,
    sessionId: session.sessionId,
  });

  return session;
}
