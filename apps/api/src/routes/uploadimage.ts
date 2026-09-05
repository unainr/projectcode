import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { getImageKitUploadAuth } from "../lib/imagekit-auth"
import type { CloudflareBindings } from "../types"


const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .get("/", async(c) => {
    const authParams = await getImageKitUploadAuth({
    privateKey: c.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: c.env.IMAGEKIT_PUBLIC_KEY,
  });

  return c.json(authParams);
  })
export default app