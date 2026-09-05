// apps/api/src/lib/composio.ts
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { Bindings } from "./env";

export function createComposio(env: Bindings) {
  return new Composio({
    apiKey: env.COMPOSIO_API_KEY,
    provider: new VercelProvider(),
  });
}





