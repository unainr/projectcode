import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@clerk/hono";

import uploadimage from "./routes/uploadimage";
import salons from "./routes/salons";
import composio from "./routes/composio";
import integrations from "./routes/integrations";
import type { CloudflareBindings } from "./types";
import chat from "./routes/chat";
import toolkits from "./routes/toolkits";
import connect from "./routes/connect";
import disconnect from "./routes/disconnect";

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.basePath("/api")
	.use("*", async (c, next) => {
		return cors({
			origin: c.env.WEB_URL,
			credentials: true,
		})(c, next);
	})
	.use("*", async (c, next) => {
		return clerkMiddleware({
			publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
			secretKey: c.env.CLERK_SECRET_KEY,
		})(c, next);
	})

	.route("/upload", uploadimage)
	.route("/salons", salons)

	.route("/composio", composio)
	.route("/integrations", integrations)
	.route("/chat", chat)
	.route("/toolkits", toolkits)
	.route("/connect", connect)
	.route("/disconnect", disconnect);

export default app;
export type AppType = typeof app;
