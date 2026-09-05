
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { aiSessions } from "../db/schema";

import { Bindings } from "./env";
import { createComposio } from "./composio";

const sessionConfig = {
  manageConnections: true,
};

export async function getComposioSession(
  env: Bindings,
  userId: string,
) {
  const db = getDb(env);

  const existing = await db
    .select()
    .from(aiSessions)
    .where(eq(aiSessions.userId, userId))
    .limit(1);

  const composio = createComposio(env);

  if (existing.length > 0) {
    const session = await composio.use(existing[0].composioSessionId);
    await session.update(sessionConfig);
    return session;
  }

  const session = await composio.sessions.create(userId, sessionConfig);

  await db.insert(aiSessions).values({
    userId,
    composioSessionId: session.sessionId,
  });

  return session;
}
