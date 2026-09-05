"use client";

import { client } from "@/lib/hono";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Message = {
	role: "user" | "assistant";
	content: string;
};

export type Toolkit = {
	slug: string;
	name: string;
	logo: string;
	isConnected: boolean;
	connectedAccountId: string | null;
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const agentKeys = {
	toolkits: (onlyConnected?: boolean) =>
		["agent", "toolkits", { onlyConnected }] as const,
};

// ─── Toolkits ─────────────────────────────────────────────────────────────────

/**
 * Fetches paginated toolkits with their connection status.
 * Pass onlyConnected=true to show only apps the user has connected.
 */
export function useToolkits(onlyConnected = false) {
	return useQuery({
		queryKey: agentKeys.toolkits(onlyConnected),
		queryFn: async (): Promise<{
			toolkits: Toolkit[];
			nextCursor: string | null;
		}> => {
			const res = await client.api.toolkits.$get({
				query: { connected: String(onlyConnected) },
			});

			if (!res.ok) throw new Error("Failed to fetch toolkits");

			const data = await res.json();

			return {
				...data,
				toolkits: data.toolkits.map((toolkit) => ({
					...toolkit,
					logo: toolkit.logo ?? "",
					isConnected: toolkit.isConnected ?? false,
				})),
			};
		},
	});
}

// ─── Connect toolkit ──────────────────────────────────────────────────────────

/**
 * Generates a Composio OAuth link for the given toolkit slug.
 * Opens it in a new tab so the user can authenticate without leaving the page.
 */
export function useConnectToolkit() {
	return useMutation({
		mutationFn: async (toolkit: string) => {
			const res = await client.api.connect.$post({
				json: { toolkit },
			});

			if (!res.ok) throw new Error("Failed to generate connect link");

			return res.json();
		},
		onSuccess: (data) => {
			// Open the Composio OAuth page in a new tab
			if (data.redirectUrl) {
				window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
			}
		},
	});
}

// ─── Disconnect toolkit ───────────────────────────────────────────────────────

/**
 * Deletes a connected account.
 * Invalidates the toolkits query so the UI updates immediately.
 */
export function useDisconnectToolkit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (connectedAccountId: string) => {
			const res = await client.api.disconnect.$post({
				json: { connectedAccountId },
			});

			if (!res.ok) throw new Error("Failed to disconnect toolkit");

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agent", "toolkits"] });
		},
	});
}

// ─── Stream chat ──────────────────────────────────────────────────────────────

/**
 * Sends the message history to the agent and yields text chunks as they arrive.
 *
 * Usage:
 *   for await (const chunk of streamChat(messages)) {
 *     setAssistantMessage(prev => prev + chunk);
 *   }
 */
export async function* streamChat(messages: Message[]): AsyncGenerator<string> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ messages }),
	});

	if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
	if (!res.body) throw new Error("No response body");

	const reader = res.body.getReader();
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const raw = decoder.decode(value, { stream: true });

		// SSE format: "data: <chunk>\n\n"
		for (const line of raw.split("\n")) {
			if (line.startsWith("data: ")) {
				yield line.slice(6);
			}
		}
	}
}
