import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .get("/test", async(c) => {
    return c.json({ message: "Hello from the protected route!" })
  })
export default app