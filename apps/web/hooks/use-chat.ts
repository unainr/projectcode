"use client";

import { client } from "@/lib/hono";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatSummary = {
	id: string;
	title: string | null;
	updatedAt: string;
	createdAt: string;
};

export type ChatMessagePart = {
	type: string;
	text?: string;
};

export type ChatMessage = {
	id: string;
	role: "user" | "assistant";
	parts: ChatMessagePart[];
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const chatKeys = {
	all: ["chats"] as const,
	list: () => [...chatKeys.all, "list"] as const,
	messages: (chatId: string) => [...chatKeys.all, "messages", chatId] as const,
};

// ─── List chats ───────────────────────────────────────────────────────────────

/**
 * Fetches all conversations for the current user, most recently updated first.
 */
export function useChats() {
	return useQuery({
		queryKey: chatKeys.list(),
		queryFn: async (): Promise<{ chats: ChatSummary[] }> => {
			const res = await client.api.chat.$get();

			if (!res.ok) throw new Error("Failed to fetch chats");

			return res.json();
		},
	});
}

// ─── Fetch one chat's messages ──────────────────────────────────────────────────

/**
 * Fetches the full message history for a single chat.
 * Pass enabled=false (or leave chatId undefined) to skip fetching, e.g. for a brand new chat.
 */
export function useChatMessages(chatId: string | null | undefined) {
	return useQuery({
		queryKey: chatKeys.messages(chatId ?? ""),
		queryFn: async (): Promise<{ chatId: string; messages: ChatMessage[] }> => {
			const res = await client.api.chat[":chatId"].messages.$get({
				param: { chatId: chatId! },
			});

			if (!res.ok) throw new Error("Failed to fetch chat messages");

			return res.json();
		},
		enabled: !!chatId,
	});
}

// ─── Delete chat ──────────────────────────────────────────────────────────────

/**
 * Deletes a conversation and invalidates the chat list so the UI updates immediately.
 */
export function useDeleteChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (chatId: string) => {
			const res = await client.api.chat[":chatId"].$delete({
				param: { chatId },
			});

			if (!res.ok) throw new Error("Failed to delete chat");

			return res.json();
		},
		onSuccess: (_data, chatId) => {
			queryClient.invalidateQueries({ queryKey: chatKeys.list() });
			queryClient.removeQueries({ queryKey: chatKeys.messages(chatId) });
		},
	});
}

// ─── Refresh chat list ──────────────────────────────────────────────────────────

/**
 * Call after a new chat is created (e.g. once the backend returns a chatId
 * from the first message in a conversation) so the sidebar picks it up.
 */
export function useInvalidateChats() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: chatKeys.list() });
}