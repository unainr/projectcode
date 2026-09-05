import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";
import { getDb } from "../db";
import { conversations, messages } from "../db/schema";
import type { CloudflareBindings } from "../types";
import { and, desc, eq } from "drizzle-orm";
import { getComposioSession } from "../lib/composio-session";

type ChatRequest = {
	messages?: UIMessage[];
};

function apiError(error: unknown) {
	const message = error instanceof Error ? error.message : "Unknown error";

	return {
		error: "Chat request failed",
		message,
	};
}

function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return "The assistant could not complete that request.";
}

function getMessageText(message: UIMessage | undefined) {
	return message?.parts
		.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("")
		.trim();
}

function truncateText(value: string, maxLength = 6_000) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength)}\n...[truncated]`;
}

function compactComposioResult(value: unknown) {
	return JSON.parse(truncateText(JSON.stringify(value, null, 2)));
}

// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)

	// GET /toolkits — list available + connected status
	.get("/", async (c) => {
		const userId = c.get("userId");

		const db = getDb(c.env);

		const result = await db
			.select({
				id: conversations.id,
				title: conversations.title,
				createdAt: conversations.createdAt,
				updatedAt: conversations.updatedAt,
			})
			.from(conversations)
			.where(eq(conversations.userId, userId))
			.orderBy(desc(conversations.updatedAt));

		return c.json(result);
	})
	.post("/", async (c) => {
		const userId = c.get("userId");
		const db = getDb(c.env);

		const [chat] = await db
			.insert(conversations)
			.values({ userId, title: "New conversation" })
			.returning();

		return c.json({ chat }, 201);
	})
	.get("/:id", async (c) => {
		const userId = c.get("userId");
		const conversationId = c.req.param("id");

		const db = getDb(c.env);

		const conversation = await db
			.select()
			.from(conversations)
			.where(
				and(
					eq(conversations.id, conversationId),
					eq(conversations.userId, userId),
				),
			)
			.limit(1);

		if (!conversation[0]) {
			return c.json(
				{
					error: "Conversation not found",
				},
				404,
			);
		}

		const conversationMessages = await db
			.select()
			.from(messages)
			.where(eq(messages.conversationId, conversationId))
			.orderBy(messages.createdAt);

		return c.json({
			conversation: conversation[0],
			messages: conversationMessages,
		});
	})
	.post("/:id/messages", async (c) => {
		const userId = c.get("userId");
		const conversationId = c.req.param("id");
		const body = await c.req.json<ChatRequest>();
		const uiMessages = body.messages ?? [];
		const latestMessage = uiMessages.at(-1);
		const userText = getMessageText(latestMessage);

		if (!latestMessage || latestMessage.role !== "user" || !userText) {
			return c.json({ error: "A user message is required" }, 400);
		}

		const db = getDb(c.env);
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(
				and(
					eq(conversations.id, conversationId),
					eq(conversations.userId, userId),
				),
			)
			.limit(1);

		if (!conversation) {
			return c.json({ error: "Conversation not found" }, 404);
		}

		await db.insert(messages).values({
			conversationId,
			role: "user",
			content: userText,
		});

		try {
			const session = await getComposioSession(c.env, userId);
			const model = createGroq({ apiKey: c.env.GROQ_API_KEY })(
				"openai/gpt-oss-120b",
			);

			const result = streamText({
				model,
				system: [
					"You are a workspace assistant that can use connected apps through Composio.",
					"Use composio_search first to find exact tool slugs and required arguments.",
					"Then use composio_execute with the exact toolSlug and a JSON args object.",
					"If a required value is missing, ask the user for it instead of guessing.",
				].join(" "),
				tools: {
					composio_search: {
						description:
							"Search connected app actions in Composio. Use this before executing an external app task.",
						inputSchema: z.object({
							query: z
								.string()
								.describe("The user's task or the app action to find."),
						}),
						execute: async ({ query }: { query: string }) => {
							const response = await session.search({ query });
							const toolSchemas = Object.fromEntries(
								Object.entries(response.toolSchemas)
									.slice(0, 5)
									.map(([slug, schema]) => [
										slug,
										{
											toolSlug: schema.toolSlug,
											toolkit: schema.toolkit,
											description: schema.description,
											inputSchema: schema.inputSchema,
										},
									]),
							);

							return compactComposioResult({
								success: response.success,
								error: response.error,
								results: response.results.slice(0, 3).map((result) => ({
									primaryToolSlugs: result.primaryToolSlugs,
									relatedToolSlugs: result.relatedToolSlugs.slice(0, 3),
									toolkits: result.toolkits,
									executionGuidance: result.executionGuidance,
									recommendedPlanSteps: result.recommendedPlanSteps?.slice(
										0,
										5,
									),
								})),
								toolSchemas,
								toolkitConnectionStatuses: response.toolkitConnectionStatuses,
								nextStepsGuidance: response.nextStepsGuidance.slice(0, 5),
							});
						},
					},
					composio_execute: {
						description:
							"Execute one exact Composio tool slug with JSON arguments after composio_search identifies it.",
						inputSchema: z.object({
							toolSlug: z
								.string()
								.describe(
									"Exact Composio tool slug, for example GITHUB_CREATE_AN_ISSUE.",
								),
							args: z
								.record(z.string(), z.unknown())
								.describe("JSON arguments for the selected tool."),
						}),
						execute: async ({
							toolSlug,
							args,
						}: {
							toolSlug: string;
							args: Record<string, unknown>;
						}) => compactComposioResult(await session.execute(toolSlug, args)),
					},
				},
				stopWhen: stepCountIs(5),
				messages: await convertToModelMessages(uiMessages),
				onFinish: async ({ text }) => {
					if (text.trim()) {
						await db.insert(messages).values({
							conversationId,
							role: "assistant",
							content: text,
						});
					}

					await db
						.update(conversations)
						.set({
							title:
								conversation.title === "New conversation"
									? userText.slice(0, 80)
									: conversation.title,
							updatedAt: new Date(),
						})
						.where(eq(conversations.id, conversationId));
				},
			});

			return result.toUIMessageStreamResponse({
				onError: getErrorMessage,
			});
		} catch (error) {
			console.error("Failed to run chat completion", error);
			return c.json(apiError(error), 500);
		}
	})
	.delete("/:id", async (c) => {
		const userId = c.get("userId");
		const conversationId = c.req.param("id");

		const db = getDb(c.env);

		const deleted = await db
			.delete(conversations)
			.where(
				and(
					eq(conversations.id, conversationId),
					eq(conversations.userId, userId),
				),
			)
			.returning({
				id: conversations.id,
			});

		if (!deleted[0]) {
			return c.json(
				{
					error: "Conversation not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
		});
	});

export default app;
