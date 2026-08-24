// apps/api/src/middleware/auth.ts
import { getAuth } from "@clerk/hono"
import { createMiddleware } from "hono/factory"

export const requireUser = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401)
  c.set("userId", auth.userId)
  await next()
})

export const requireAuth = createMiddleware<{
  Variables: { userId: string; orgId?: string }
}>(async (c, next) => {
  const auth = getAuth(c)
  if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401)
  if (!auth.orgId) return c.json({ message: "No organization selected" }, 401)
  c.set("userId", auth.userId)
  c.set("orgId", auth.orgId)
  await next()
})