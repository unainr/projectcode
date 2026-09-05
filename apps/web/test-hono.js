import { hc } from "hono/client"; const client = hc("http://localhost:3000"); console.log(client.api.composio.connect[":toolkit"].$url({ param: { toolkit: "gmail" } }).toString());
