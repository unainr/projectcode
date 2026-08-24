import { hc } from "hono/client";
import type { AppType } from "@workspace/api";

type GetToken = () => Promise<string | null>;

// Mutable reference — starts as a no-op so any request fired before
// Clerk mounts goes out unauthenticated instead of throwing.
let getTokenRef: GetToken = async () => null;

export function setAuthTokenGetter(fn: GetToken) {
	getTokenRef = fn;
}

// Single instance for the app's lifetime. Every hook imports this directly.
export const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!, {
	headers: async (): Promise<Record<string, string>> => {
		const token = await getTokenRef();
		return token ? { Authorization: `Bearer ${token}` } : {};
	},
});
