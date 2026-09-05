"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * /agent/callback
 *
 * Composio redirects here after the user authenticates an app.
 * URL params: ?toolkit=github&status=success&connected_account_id=ca_xxx
 *
 * We invalidate the toolkits query so ToolkitPanel shows the new
 * connection immediately when the user returns to /agent.
 */
export default function CallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const status = params.get("status");
  const toolkit = params.get("toolkit") ?? "App";
  const success = status === "success";

  useEffect(() => {
    if (success) {
      // Invalidate so ToolkitPanel re-fetches with the new connection
      queryClient.invalidateQueries({ queryKey: ["agent", "toolkits"] });
    }

    // Return to agent page after a short moment
    const timer = setTimeout(() => router.push("/agent"), 1800);
    return () => clearTimeout(timer);
  }, [success, queryClient, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-2">
        {success ? (
          <>
            <p className="text-2xl">✓</p>
            <p className="font-semibold capitalize">{toolkit} connected</p>
            <p className="text-sm text-muted-foreground">Returning to agent…</p>
          </>
        ) : (
          <>
            <p className="text-2xl">✗</p>
            <p className="font-semibold">Connection failed</p>
            <p className="text-sm text-muted-foreground">Returning to agent…</p>
          </>
        )}
      </div>
    </div>
  );
}
