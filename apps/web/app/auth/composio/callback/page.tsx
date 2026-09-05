"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

export default function ComposioCallbackPage() {
  const params = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const error = params.get("error");
  const status = params.get("status");
  const isSuccess = !error && status !== "failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-sm">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto mb-3 size-9 text-emerald-600" />
        ) : (
          <CircleAlert className="mx-auto mb-3 size-9 text-destructive" />
        )}
        <h1 className="text-base font-semibold">
          {isSuccess ? "Connection complete" : "Connection failed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSuccess
            ? "You can close this window and return to the chat."
            : error ?? "Please close this window and try connecting again."}
        </p>
      </div>
    </main>
  );
}
