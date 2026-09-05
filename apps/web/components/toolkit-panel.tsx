"use client";

import { useState } from "react";
import {
  useToolkits,
  useConnectToolkit,
  useDisconnectToolkit,
  type Toolkit,
} from "@/hooks/use-agent";

// ─── Root panel ───────────────────────────────────────────────────────────────

export function ToolkitPanel() {
  const { data, isLoading, isError } = useToolkits();

  if (isLoading) return <ToolkitSkeleton />;
  if (isError) return <p className="text-sm text-red-500">Failed to load apps.</p>;

  return (
    <aside className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Connected Apps
      </h2>

      <ul className="flex flex-col gap-1">
        {data?.toolkits.map((toolkit) => (
          <ToolkitRow key={toolkit.slug} toolkit={toolkit} />
        ))}
      </ul>
    </aside>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────

function ToolkitRow({ toolkit }: { toolkit: Toolkit }) {
  const connect = useConnectToolkit();
  const disconnect = useDisconnectToolkit();
  const [confirming, setConfirming] = useState(false);

  const handleConnect = () => connect.mutate(toolkit.slug);

  const handleDisconnect = () => {
    if (!toolkit.connectedAccountId) return;

    if (!confirming) {
      setConfirming(true);
      return;
    }

    disconnect.mutate(toolkit.connectedAccountId, {
      onSettled: () => setConfirming(false),
    });
  };

  return (
    <li className="flex items-center justify-between rounded-lg border px-3 py-2">
      {/* App info */}
      <div className="flex items-center gap-2">
        <img
          src={toolkit.logo}
          alt={toolkit.name}
          className="h-6 w-6 rounded"
        />
        <div className="leading-tight">
          <p className="text-sm font-medium">{toolkit.name}</p>
          <p className="text-xs text-muted-foreground">
            {toolkit.isConnected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>

      {/* Action */}
      {toolkit.isConnected ? (
        <button
          onClick={handleDisconnect}
          disabled={disconnect.isPending}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          {confirming ? "Confirm?" : "Disconnect"}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connect.isPending && connect.variables === toolkit.slug}
          className="text-xs text-primary hover:underline disabled:opacity-50"
        >
          Connect
        </button>
      )}
    </li>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ToolkitSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
