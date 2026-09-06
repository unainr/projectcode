import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { z } from "zod";

import { getOrCreateSession } from "../lib/session";
import type { CloudflareBindings } from "../types";

const ALLOWED_TOOLKITS = [
	"gmail",
	"slack",
	"notion",
	"github",
	"googlecalendar",
	"instagram",
];

// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)
	.get("/", async (c) => {
		const userId = c.get("userId");
		const onlyConnected = c.req.query("connected") === "true";
		const cursor = c.req.query("cursor") ?? undefined;

		const session = await getOrCreateSession(userId, c.env);

		const result = await session.toolkits({
			limit: 20,
			toolkits: ALLOWED_TOOLKITS, // <-- filters server-side, not just the 20 you happened to get back
			...(onlyConnected && { isConnected: true }),
			...(cursor && { nextCursor: cursor }),
		});

		const toolkits = result.items
			.filter((toolkit) => ALLOWED_TOOLKITS.includes(toolkit.slug))
			.map((toolkit) => ({
				slug: toolkit.slug,
				name: toolkit.name,
				logo: toolkit.logo,
				isConnected: toolkit.connection?.isActive,
				// Only present when connected — used to disconnect
				connectedAccountId: toolkit.connection?.isActive
					? (toolkit.connection.connectedAccount?.id ?? null)
					: null,
			}));

		return c.json({
			toolkits,
			nextCursor: result.cursor ?? null,
		});
	});

export default app;
