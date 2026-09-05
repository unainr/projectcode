import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import type { CloudflareBindings } from "../types";
import { createComposio } from "../lib/composio";
import { getComposioSession } from "../lib/composio-session";

function getComposioCallbackUrl(env: CloudflareBindings) {
	return new URL("/auth/composio/callback", env.WEB_URL).toString();
}

function composioErrorResponse(error: unknown) {
	const message =
		error instanceof Error ? error.message : "Unknown Composio error";

	return {
		error: "Composio request failed",
		message,
	};
}

// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)

	// GET /toolkits — list available + connected status
	.get("/", async (c) => {
		const userId = c.get("userId");

		try {
			const session = await getComposioSession(c.env, userId);

			const { items: toolkits } = await session.toolkits({
				limit: 50,
			});

			return c.json({
				toolkits: toolkits.map((toolkit) => ({
					slug: toolkit.slug,
					name: toolkit.name,
					logo: toolkit.logo,

					connected: toolkit.connection?.isActive ?? false,

					connectedAccountId: toolkit.connection?.connectedAccount?.id ?? null,
				})),
			});
		} catch (error) {
			console.error("Failed to fetch Composio toolkits", error);
			return c.json(composioErrorResponse(error), 500);
		}
	})

	/**
	 * POST /integrations/:toolkit/connect
	 */
	.post("/:toolkit/connect", async (c) => {
		const userId = c.get("userId");

		const toolkit = c.req.param("toolkit");

		try {
			const session = await getComposioSession(c.env, userId);

			const result = await session.authorize(toolkit, {
				callbackUrl: getComposioCallbackUrl(c.env),
			});

			return c.json({
				redirectUrl: result.redirectUrl,
			});
		} catch (error) {
			console.error("Failed to start Composio authorization", error);
			return c.json(composioErrorResponse(error), 500);
		}
	})

	/**
	 * POST /integrations/:toolkit/disconnect
	 */
	.post("/:toolkit/disconnect", async (c) => {
		const userId = c.get("userId");

		const toolkit = c.req.param("toolkit");

		try {
			const session = await getComposioSession(c.env, userId);

			const { items: toolkits } = await session.toolkits({
				limit: 50,
			});

			const target = toolkits.find((item) => item.slug === toolkit);

			const accountId = target?.connection?.connectedAccount?.id;

			if (!accountId) {
				return c.json({
					success: true,
				});
			}

			const composio = createComposio(c.env);

			await composio.connectedAccounts.disable(accountId);

			return c.json({
				success: true,
			});
		} catch (error) {
			console.error("Failed to disconnect Composio toolkit", error);
			return c.json(composioErrorResponse(error), 500);
		}
	});
export default app;
