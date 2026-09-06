import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { createComposio } from "../lib/composio";
import type { CloudflareBindings } from "../types";

const DisconnectBodySchema = z.object({
  // "ca_abc123" — comes from the toolkits list responseo
  connectedAccountId: z.string().min(1),
});

// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
    .use("*", requireUser)
.post(
  "/",
  zValidator("json", DisconnectBodySchema),
  async (c) => {
      const composio = createComposio(c.env);
    const { connectedAccountId } = c.req.valid("json");

    await composio.connectedAccounts.delete(connectedAccountId);

    return c.json({ success: true });
  }
);


export default app;
