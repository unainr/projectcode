// apps/web/hooks/use-toolkits.ts
"use client";
import { client } from "@/lib/hono";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useToolkits() {
	return useQuery({
		queryKey: ["toolkits"],
		queryFn: async () => {
			const res = await client.api.integrations.$get();
			if (!res.ok) throw new Error("Failed to fetch toolkits");
			const { toolkits } = await res.json();
			return toolkits;
		},
	});
}

export function useConnectToolkit() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (slug: string) => {
			const res = await client.api.integrations[":toolkit"].connect.$post({
				param: { toolkit: slug },
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to start connection: ${text}`);
			}
			const { redirectUrl } = await res.json();
			if (!redirectUrl) throw new Error("No redirect URL returned");
			return { redirectUrl };
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["toolkits"] }),
	});
}

export function useDisconnectToolkit() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (slug: string) => {
			const res = await client.api.integrations[":toolkit"].disconnect.$post({
				param: { toolkit: slug },
			});
			if (!res.ok) throw new Error("Failed to disconnect toolkit");
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["toolkits"] }),
	});
}

export function usePollToolkitStatus(slug: string, enabled: boolean) {
	return useQuery({
		queryKey: ["toolkits", "poll", slug],
		queryFn: async () => {
			const res = await client.api.integrations.$get();
			if (!res.ok) throw new Error("Failed to fetch toolkits");
			const { toolkits } = await res.json();
			return (
				toolkits.find((t) => t.slug === slug) ?? { slug, connected: false }
			);
		},
		enabled,
		refetchInterval: (query) => (query.state.data?.connected ? false : 2000),
	});
}

export function useCreateChat() {
	return useMutation({
		mutationFn: async () => {
			const res = await client.api.composio.$post();
			return res.json();
		},
	});
}
