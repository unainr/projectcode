"use client"

import { useAuth } from "@clerk/nextjs"
import { setAuthTokenGetter } from "@/lib/hono"

// Renders nothing. Syncs Clerk's real getToken into the module-level
// client during render (not useEffect) so there's no post-mount gap
// where a child's first request could fire unauthenticated.
export function HonoAuthBridge() {
  const { getToken } = useAuth()
  setAuthTokenGetter(getToken)
  return null
}