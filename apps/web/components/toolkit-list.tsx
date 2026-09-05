"use client";
import { useState } from "react";
import {
	useToolkits,
	useConnectToolkit,
	useDisconnectToolkit,
	usePollToolkitStatus,
} from "@/hooks/use-toolkits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Loader2, Unplug, Wrench } from "lucide-react";

function ToolkitRow({
	slug,
	name,
	connected,
}: {
	slug: string;
	name: string;
	connected: boolean;
}) {
	const [polling, setPolling] = useState(false);
	const connect = useConnectToolkit();
	const disconnect = useDisconnectToolkit();
	const { data } = usePollToolkitStatus(slug, polling);

	const isConnected = connected || data?.connected;

	if (isConnected) {
		return (
			<div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 pl-3 pr-1 py-1">
				<Badge
					variant="secondary"
					className="gap-1.5 bg-transparent p-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">
					<Check className="size-3.5 stroke-[2.5]" />
					{name}
				</Badge>
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label={`Disconnect ${name}`}
					title={`Disconnect ${name}`}
					disabled={disconnect.isPending}
					onClick={() => disconnect.mutate(slug)}
					className="text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-400">
					{disconnect.isPending ? (
						<Loader2 className="size-3 animate-spin" />
					) : (
						<Unplug className="size-3" />
					)}
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			disabled={connect.isPending}
			onClick={async () => {
				try {
					const { redirectUrl } = await connect.mutateAsync(slug);
					window.open(redirectUrl, "_blank", "width=500,height=700");
					setPolling(true);
				} catch (err) {
					console.error("Connection failed", err);
				}
			}}
			className="text-xs capitalize h-8 gap-1.5 cursor-pointer hover:bg-muted">
			{connect.isPending ? (
				<Loader2 className="size-3 animate-spin" />
			) : (
				<ExternalLink className="size-3 text-muted-foreground" />
			)}
			Connect {name}
		</Button>
	);
}

export function ToolkitList() {
	const { data: toolkits, isLoading, error } = useToolkits();

	return (
		<div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm w-full max-w-4xl mx-auto mb-4">
			<div className="flex items-center gap-2 mb-3">
				<Wrench className="size-4 text-muted-foreground" />
				<div>
					<h3 className="text-sm font-semibold tracking-tight">
						Workspace connections
					</h3>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Give your assistant access to the tools you use every day.
					</p>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
					<Loader2 className="size-3.5 animate-spin" />
					<span>Loading tool integrations...</span>
				</div>
			) : error ? (
				<p className="text-xs text-destructive">Failed to load toolkits.</p>
			) : (
				<div className="flex flex-wrap gap-2">
					{toolkits?.map((t) => (
						<ToolkitRow
							key={t.slug}
							slug={t.slug}
							name={t.name}
							connected={t.connected}
						/>
					))}
				</div>
			)}
		</div>
	);
}
